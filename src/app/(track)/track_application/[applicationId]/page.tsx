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
import { trpc } from "@/lib/trpc/client";

const STATUS_ICONS: Record<string, React.ElementType> = {
  "Paper Screening": FileText,
  Exam: ClipboardCheck,
  "HR Interview": Users,
  "Technical Interview": Code2,
  "Final Interview": Award,
  "Job Offer": CheckCircle,
};

export default function ApplicationTrackingPage() {
  const { applicationId } = useParams();

  const fetchApplication = trpc.joblisting.fetchApplication.useQuery(
    { applicantId: applicationId as string },
    {
      enabled: !!applicationId,
    },
  );

  const application = fetchApplication.data?.data;

  const currentStepIndex = CANDIDATE_STATUSES.indexOf(
    fetchApplication.data?.data.status || "Paper Screening",
  );

  const getStageDetails = (status: string) => {
    const details: Record<string, Record<string, string>> = {
      "Paper Screening": {},
      Exam: {
        date: application?.scheduledAt
          ? new Date(application.scheduledAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "TBA",
        time: application?.scheduledAt
          ? new Date(application.scheduledAt).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })
          : "TBA",
        platform: application?.platform || "TBA",
      },
      "HR Interview": {
        date: application?.scheduledAt
          ? new Date(application.scheduledAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "TBA",
        time: application?.scheduledAt
          ? new Date(application.scheduledAt).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })
          : "TBA",
        platform: application?.platform || "TBA",
      },
      "Technical Interview": {
        date: application?.scheduledAt
          ? new Date(application.scheduledAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "TBA",
        time: application?.scheduledAt
          ? new Date(application.scheduledAt).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })
          : "TBA",
        platform: application?.platform || "TBA",
      },
      "Final Interview": {
        date: application?.scheduledAt
          ? new Date(application.scheduledAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "TBA",
        time: application?.scheduledAt
          ? new Date(application.scheduledAt).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })
          : "TBA",
        platform: application?.platform || "TBA",
      },
      "Job Offer": {},
    };

    return details[status] || {};
  };
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
            Position: {application?.jobTitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {CANDIDATE_STATUSES.map((status, index) => {
            const Icon = STATUS_ICONS[status] || FileText; // Add fallback
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(
              application?.status ? getStageDetails(application.status) : {},
            ).map(([key, value]) => {
              const isMeetingLink =
                key === "platform" &&
                typeof value === "string" &&
                /^(https?:\/\/|www\.)/i.test(value);

              return (
                <div
                  key={key}
                  className="bg-white/70 backdrop-blur border border-gray-200 rounded-xl p-4 text-center shadow-sm"
                >
                  <p className="text-sm text-gray-500 capitalize mb-2">{key}</p>

                  {isMeetingLink ? (
                    <a
                      href={
                        value.startsWith("http") ? value : `https://${value}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        inline-flex items-center gap-2
                        px-4 py-2
                        rounded-lg
                        bg-white/40
                        backdrop-blur-md
                        border border-white/60
                        shadow-md
                        text-red-600 font-semibold
                        transition-all duration-300
                        hover:bg-red-600 hover:text-white
                        hover:shadow-lg
                        active:scale-95
                      "
                    >
                      🔗 Join Meeting Here
                    </a>
                  ) : (
                    <p className="text-gray-500 text-center">
                      No additional details available for this stage.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* {(() => {
            const currentDetails = application?.status
              ? getStageDetails(application.status)
              : {};
            return Object.keys(currentDetails).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(currentDetails).map(([key, value]) => (
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
            );
          })()}
        </div> */}

          <p className="text-center text-xs text-gray-400">
            Please monitor this page regularly for updates regarding your
            application.
          </p>
        </div>
      </div>
    </div>
  );
}
