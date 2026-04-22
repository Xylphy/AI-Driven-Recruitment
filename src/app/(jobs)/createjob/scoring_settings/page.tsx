"use client";

import useAuth from "@/hooks/useAuth";
import { PENDING_JOB_LISTING_KEY } from "@/lib/constants";
import { swalError, swalInfo } from "@/lib/swal";
import { trpc } from "@/lib/trpc/client";
import type { JobListing, Tags } from "@/types/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type BehavioralWeights = {
  softSkills: number;
  transcription: number;
  culturalFit: number;
  transcriptionCulture: number;
};

export default function JobScoringConfiguration() {
  const router = useRouter();
  const [isPosted] = useState(false);
  const { isAuthenticated } = useAuth();

  const [behavioral, setBehavioral] = useState<BehavioralWeights>({
    softSkills: 0.3,
    transcription: 0.25,
    culturalFit: 0.15,
    transcriptionCulture: 0.3,
  });

  const [jobListing, setJobListing] = useState<JobListing & Tags>({
    title: "",
    qualifications: [],
    requirements: [],
    tags: [],
    location: "Cebu City",
    isFullTime: true,
  });
  const [hrOfficerId, setHrOfficerId] = useState<string | null>(null);

  const [jobFitWeight, setJobFitWeight] = useState(0.4);
  const [behavioralBlendWeight, setBehavioralBlendWeight] = useState(0.6);
  const [benchmark, setBenchmark] = useState(0.8);
  const createJobMutation = trpc.joblisting.createJoblisting.useMutation();

  const behavioralTotal = useMemo(() => {
    return Object.values(behavioral).reduce((a, b) => a + b, 0);
  }, [behavioral]);

  const predictiveTotal = useMemo(() => {
    return jobFitWeight + behavioralBlendWeight;
  }, [jobFitWeight, behavioralBlendWeight]);

  const behavioralValid = Math.abs(behavioralTotal - 1) < 0.001;
  const predictiveValid = Math.abs(predictiveTotal - 1) < 0.001;

  const updateBehavioral = (key: keyof BehavioralWeights, value: number) => {
    const otherKeys = Object.keys(behavioral).filter(
      (k) => k !== key,
    ) as (keyof BehavioralWeights)[];

    const remaining = 1 - value;
    const othersTotal = otherKeys.reduce((sum, k) => sum + behavioral[k], 0);
    const updated: BehavioralWeights = { ...behavioral };

    updated[key] = value;

    otherKeys.forEach((k) => {
      updated[k] = (behavioral[k] / othersTotal) * remaining;
    });

    setBehavioral(updated);
  };

  const updatePredictive = (value: number) => {
    setJobFitWeight(value);
    setBehavioralBlendWeight(1 - value);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const pendingJob = window.sessionStorage.getItem(PENDING_JOB_LISTING_KEY);

    if (!pendingJob) {
      swalError(
        "No Job Data",
        "Please complete the job details before configuring scoring.",
      );
      return;
    }

    try {
      const { jobData, hrOfficerId } = JSON.parse(pendingJob);
      setJobListing(jobData);
      setHrOfficerId(hrOfficerId);
    } catch {
      swalError(
        "Invalid Job Data",
        "There was an error loading your job details. Please start over.",
      );
    }
  }, [isAuthenticated]);

  const handleSubmit = async () => {
    if (!behavioralValid || !predictiveValid) {
      return;
    }

    await createJobMutation.mutateAsync(
      {
        ...jobListing,
        hrOfficerId: hrOfficerId || undefined,
        scoringSettings: {
          softSkillsWeight: behavioral.softSkills,
          transcriptionWeight: behavioral.transcription,
          culturalFitWeight: behavioral.culturalFit,
          transcriptionCulturalFitWeight: behavioral.transcriptionCulture,
          jobFitWeight: jobFitWeight,
          behavioralBlendWeight: behavioralBlendWeight,
          benchmark,
        },
      },
      {
        onSuccess: () => {
          swalInfo(
            "Success",
            "Job listing created successfully with the configured scoring settings.",
          );
          window.sessionStorage.removeItem(PENDING_JOB_LISTING_KEY);
          router.push("/admin");
        },
        onError: () => {
          swalError(
            "Creation Failed",
            "There was an error creating the job listing. Please try again.",
          );
        },
      },
    );
  };

  return (
    <div className="min-h-screen p-10 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-red-100 via-white to-red-50 opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        <h2 className="text-3xl font-bold text-red-600">
          AI Scoring Configuration
        </h2>

        <GlassCard title="Behavioral Blend Weights">
          <ModernSlider
            label="Soft Skills Score"
            value={behavioral.softSkills}
            onChange={(v) => updateBehavioral("softSkills", v)}
            disabled={isPosted}
          />

          <ModernSlider
            label="Transcription Score"
            value={behavioral.transcription}
            onChange={(v) => updateBehavioral("transcription", v)}
            disabled={isPosted}
          />

          <ModernSlider
            label="Cultural Fit Score"
            value={behavioral.culturalFit}
            onChange={(v) => updateBehavioral("culturalFit", v)}
            disabled={isPosted}
          />

          <ModernSlider
            label="Transcription Cultural Fit Score"
            value={behavioral.transcriptionCulture}
            onChange={(v) => updateBehavioral("transcriptionCulture", v)}
            disabled={isPosted}
          />

          <TotalBar total={behavioralTotal} valid={behavioralValid} />
        </GlassCard>

        <GlassCard title="Predictive Success Weights">
          <ModernSlider
            label="Job Fit Score (Hard Skills)"
            value={jobFitWeight}
            onChange={(v) => updatePredictive(v)}
            disabled={isPosted}
          />

          <ModernSlider
            label="Behavioral Blend"
            value={behavioralBlendWeight}
            onChange={(v) => updatePredictive(1 - v)}
            disabled={isPosted}
          />

          <TotalBar total={predictiveTotal} valid={predictiveValid} />
        </GlassCard>

        <GlassCard title="AI Benchmark">
          <p className="text-sm text-gray-500 mb-4">
            Controls how strict the AI scoring is. The closer to <b>1.00</b>,
            the harsher the evaluation.
          </p>

          <p className="text-xs text-gray-400 mb-4">
            Recommended range: <b>0.65 – 0.85</b>
          </p>

          <ModernSlider
            label="Benchmark"
            value={benchmark}
            min={0.5}
            max={1}
            step={0.01}
            onChange={setBenchmark}
            disabled={isPosted}
          />
        </GlassCard>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!behavioralValid || !predictiveValid}
            type="button"
            className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition
            ${
              behavioralValid && predictiveValid
                ? "bg-linear-to-r from-red-600 to-red-500 hover:opacity-90"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Save Scoring Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

function GlassCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl rounded-2xl p-6 space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      {children}
    </div>
  );
}

function ModernSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled: boolean;
}) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="font-semibold text-red-600 text-sm">
          {(value * 100).toFixed(0)}%
        </span>
      </div>

      <div className="relative">
        <div className="h-3 w-full rounded-full bg-white/40 border border-white/30 backdrop-blur-md overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-red-500 to-red-400 transition-all duration-200"
            style={{ width: `${percent}%` }}
          />
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className={
            [
              "absolute top-0 left-0 w-full h-3",
              "appearance-none bg-transparent",
              "cursor-pointer",
              "z-10",
              disabled ? "cursor-not-allowed opacity-50" : "",
            ].join(" ")
          }
        />
      </div>

      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          background: linear-gradient(to right, #dc2626, #ef4444);
          border: 2px solid white;
          box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 6px 20px rgba(220, 38, 38, 0.6);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          background: linear-gradient(to right, #dc2626, #ef4444);
          border: 2px solid white;
          box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function TotalBar({ total, valid }: { total: number; valid: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span>Total</span>
        <span>{(total * 100).toFixed(0)}%</span>
      </div>

      <div className="h-3 w-full rounded-full bg-white/40 overflow-hidden">
        <div
          className={`h-full ${
            valid ? "bg-green-500" : "bg-yellow-500"
          } transition-all`}
          style={{ width: `${Math.min(total * 100, 100)}%` }}
        />
      </div>

      {!valid && (
        <p className="text-yellow-600 text-sm">
          Section must equal exactly 100%.
        </p>
      )}
    </div>
  );
}
