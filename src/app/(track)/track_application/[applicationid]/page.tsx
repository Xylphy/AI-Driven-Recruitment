"use client";

import clsx from "clsx";
import {
  Award,
  CheckCircle,
  ClipboardCheck,
  Code2,
  FileText,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { CANDIDATE_STATUSES } from "@/lib/constants";

type CandidateStatus = (typeof CANDIDATE_STATUSES)[number];

const STATUS_ICONS: Record<string, React.ElementType> = {
  "Paper Screening": FileText,
  Exam: ClipboardCheck,
  "HR Interview": Users,
  "Technical Interview": Code2,
  "Final Interview": Award,
  "Job Offer": Award,
};

const MOCK_APPLICATION = {
  applicationId: "APP-2024-00123",
  jobTitle: "Frontend Engineer",
  currentStatus: "HR Interview" as CandidateStatus,

  details: {
    Exam: {
      date: "October 20, 2026",
      time: "10:00 AM",
      location: "Alliance Exam Center – Cebu",
    },
    "HR Interview": {
      date: "October 25, 2026",
      time: "2:00 PM",
      platform: "Google Meet",
    },
    "Technical Interview": {
      date: "October 30, 2026",
      time: "1:00 PM",
      platform: "Zoom",
    },
  },
};

export default function ApplicationTrackingPage() {
  const { applicationId } = useParams();

  const currentStepIndex = CANDIDATE_STATUSES.indexOf(
    MOCK_APPLICATION.currentStatus,
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl backdrop-blur-xl bg-white/70 border border-white/30 shadow-xl rounded-2xl p-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-red-600">
            Application Tracking
          </h1>
          <p className="text-gray-600">
            Application ID:{" "}
            <span className="font-semibold">{applicationId}</span>
          </p>
          <p className="text-sm text-gray-500">
            Position: {MOCK_APPLICATION.jobTitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {CANDIDATE_STATUSES.map((status, index) => {
            const Icon = STATUS_ICONS[status];
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div
                key={status}
                className={clsx(
                  "flex flex-col items-center text-center p-4 rounded-xl transition-all",
                  "backdrop-blur-md border",
                  isCompleted && "bg-green-100/60 border-green-300",
                  isCurrent && "bg-red-100/60 border-red-400 scale-105",
                  !isCompleted && !isCurrent && "bg-white/50 border-gray-200",
                )}
              >
                <div
                  className={clsx(
                    "w-12 h-12 flex items-center justify-center rounded-full mb-2",
                    isCompleted && "bg-green-500 text-white",
                    isCurrent && "bg-red-600 text-white",
                    !isCompleted && !isCurrent && "bg-gray-200 text-gray-600",
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>

                <span className="text-sm font-semibold">{status}</span>
              </div>
            );
          })}
        </div>

        <div className="backdrop-blur-lg bg-white/60 border border-white/40 rounded-xl p-6 shadow-inner">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Current Stage Details
          </h2>

          {MOCK_APPLICATION.details[
            MOCK_APPLICATION.currentStatus as keyof typeof MOCK_APPLICATION.details
          ] ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(
                MOCK_APPLICATION.details[
                  MOCK_APPLICATION.currentStatus as keyof typeof MOCK_APPLICATION.details
                ],
              ).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-white/70 backdrop-blur border border-gray-200 rounded-lg p-4 text-center"
                >
                  <p className="text-sm text-gray-500 capitalize">{key}</p>
                  <p className="font-semibold text-gray-800">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              No additional details available for this stage.
            </p>
          )}
        </div>

        <p className="text-center text-xs text-gray-400">
          Please monitor this page regularly for updates regarding your
          application.
        </p>
      </div>
    </div>
  );
}
