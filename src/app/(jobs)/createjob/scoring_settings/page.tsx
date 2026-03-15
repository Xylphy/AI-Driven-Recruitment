"use client";

import { useMemo, useState } from "react";

type BehavioralWeights = {
  softSkills: number;
  transcription: number;
  culturalFit: number;
  transcriptionCulture: number;
};

export default function JobScoringConfiguration() {
  const [isPosted] = useState(false);

  const [behavioral, setBehavioral] = useState<BehavioralWeights>({
    softSkills: 0.3,
    transcription: 0.25,
    culturalFit: 0.15,
    transcriptionCulture: 0.3,
  });

  const [jobFitWeight, setJobFitWeight] = useState(0.4);
  const [behavioralBlendWeight, setBehavioralBlendWeight] = useState(0.6);

  const [benchmark, setBenchmark] = useState(0.8);

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

  const handleSubmit = () => {
    if (!behavioralValid || !predictiveValid) return;

    const payload = {
      soft_skills_weight: behavioral.softSkills,
      transcription_weight: behavioral.transcription,
      cultural_fit_weight: behavioral.culturalFit,
      transcription_cultural_fit_weight: behavioral.transcriptionCulture,
      job_fit_weight: jobFitWeight,
      behavioral_blend_weight: behavioralBlendWeight,
      benchmark,
    };

    console.log("Scoring config payload:", payload);
  };

  return (
    <div className="min-h-screen p-10 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-100 via-white to-red-50 opacity-40 pointer-events-none" />

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
            className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition
            ${
              behavioralValid && predictiveValid
                ? "bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90"
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
      <div className="flex justify-between">
        <span className="text-gray-700">{label}</span>
        <span className="font-semibold text-red-600">
          {(value * 100).toFixed(0)}%
        </span>
      </div>

      <div className="relative group">
        <div className="h-3 w-full rounded-full bg-white/40 border border-white/30 backdrop-blur" />

        <div
          className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute top-0 w-full h-3 opacity-0 cursor-pointer"
        />

        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border border-red-300 shadow-lg transition-all group-hover:scale-110"
          style={{ left: `calc(${percent}% - 10px)` }}
        />
      </div>
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
