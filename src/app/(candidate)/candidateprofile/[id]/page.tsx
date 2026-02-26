"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import {
  FaDiscord,
  FaFacebook,
  FaGithub,
  FaGitlab,
  FaInstagram,
  FaLinkedin,
  FaMedium,
  FaStackOverflow,
  FaTiktok,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { MdArrowBack, MdEmail, MdLink, MdPhone } from "react-icons/md";
import Swal from "sweetalert2";
import HRReport from "@/components/admin/candidateProfile/HRReport";
import useAuth from "@/hooks/useAuth";
import { CANDIDATE_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/library";
import { swalError, swalSuccess } from "@/lib/swal";
import { trpc } from "@/lib/trpc/client";
import type { CandidateStatuses } from "@/types/types";

const CandidateProfile = dynamic(
  () => import("@/components/admin/candidateProfile/CandidateProfile"),
  { ssr: false },
);

const CandidateResume = dynamic(
  () => import("@/components/admin/candidateProfile/CandidateResume"),
  { ssr: false },
);

type LinkMeta = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  url: string;
};

function getLinkMeta(rawUrl: string) {
  const input = rawUrl?.trim();
  if (!input) return null;

  const lower = input.toLowerCase();

  const looksLikeEmail =
    !lower.startsWith("http") &&
    !lower.startsWith("mailto:") &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower);

  if (lower.startsWith("mailto:") || looksLikeEmail) {
    const mailto = lower.startsWith("mailto:") ? input : `mailto:${input}`;
    return { icon: MdEmail, label: "Email", url: mailto };
  }

  // Phone
  const digits = lower.replace(/[^\d]/g, "");
  if (
    lower.startsWith("tel:") ||
    (digits.length >= 7 && /^[+0-9\s\-()]+$/.test(lower))
  ) {
    const tel = lower.startsWith("tel:") ? input : `tel:${input}`;
    return { icon: MdPhone, label: "Phone", url: tel };
  }

  const normalized =
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("mailto:") ||
    lower.startsWith("tel:")
      ? input
      : `https://${input}`;

  // Try to parse hostname for robust matching
  let hostname = "";
  try {
    hostname = new URL(normalized).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return { icon: MdLink, label: "Link", url: normalized };
  }

  const providers: Array<{
    host: string | RegExp;
    icon: LinkMeta["icon"];
    label: string;
  }> = [
    { host: /(^|\.)facebook\.com$/, icon: FaFacebook, label: "Facebook" },
    { host: /(^|\.)instagram\.com$/, icon: FaInstagram, label: "Instagram" },
    { host: /(^|\.)github\.com$/, icon: FaGithub, label: "GitHub" },
    { host: /(^|\.)gitlab\.com$/, icon: FaGitlab, label: "GitLab" },
    { host: /(^|\.)linkedin\.com$/, icon: FaLinkedin, label: "LinkedIn" },
    { host: /(^|\.)x\.com$|(^|\.)twitter\.com$/, icon: FaTwitter, label: "X" },
    {
      host: /(^|\.)youtube\.com$|(^|\.)youtu\.be$/,
      icon: FaYoutube,
      label: "YouTube",
    },
    { host: /(^|\.)tiktok\.com$/, icon: FaTiktok, label: "TikTok" },
    { host: /(^|\.)medium\.com$/, icon: FaMedium, label: "Medium" },
    {
      host: /(^|\.)stackoverflow\.com$/,
      icon: FaStackOverflow,
      label: "Stack Overflow",
    },
    {
      host: /(^|\.)discord\.gg$|(^|\.)discord\.com$/,
      icon: FaDiscord,
      label: "Discord",
    },
  ];

  const match = providers.find((p) =>
    typeof p.host === "string" ? hostname === p.host : p.host.test(hostname),
  );

  if (match) return { icon: match.icon, label: match.label, url: normalized };

  return { icon: MdLink, label: "Link", url: normalized };
}

export default function Page() {
  const router = useRouter();
  const candidateId = useParams().id as string;
  const { isAuthenticated } = useAuth();
  const [selectedStatus, setSelectedStatus] =
    useState<CandidateStatuses | null>(null);
  const [activeTab, setActiveTab] = useState<"evaluation" | "resume">(
    "evaluation",
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<CandidateStatuses | null>(
    null,
  );

  const [scheduleData, setScheduleData] = useState({
    date: "",
    time: "",
    location: "",
  });
  // New: edit form state
  const [editScore, setEditScore] = useState<number>(0);
  const [editHighlights, setEditHighlights] = useState<string>("");
  const [editSummary, setEditSummary] = useState<string>("");

  const userJWT = trpc.auth.decodeJWT.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { id: userId } = userJWT.data?.user || {};

  const candidateProfileQuery = trpc.candidate.fetchCandidateProfile.useQuery(
    {
      candidateId,
      fetchScore: true,
      fetchTranscribed: true,
      fetchResume: true,
      fetchSkills: true,
      fetchSocialLinks: true,
    },
    { enabled: isAuthenticated },
  );

  const updateCandidateStatusMutation =
    trpc.candidate.updateCandidateStatus.useMutation();

  const createHRReportMutation = trpc.staff.postHrReport.useMutation();
  const getHRReportsQuery = trpc.staff.fetchHRReports.useQuery(
    { applicantId: candidateId },
    {
      enabled: isAuthenticated,
    },
  );
  const deleteHRReportMutation = trpc.hrOfficer.deleteHRReport.useMutation();
  const updateHRReportMutation = trpc.hrOfficer.editHRReport.useMutation();

  const hrReportsData = useMemo(
    () => getHRReportsQuery.data ?? [],
    [getHRReportsQuery.data],
  );

  const hasReports = hrReportsData.length > 0;

  const editingReport = useMemo(() => {
    if (editingIndex === null) return null;
    return hrReportsData[editingIndex] ?? null;
  }, [editingIndex, hrReportsData]);

  useEffect(() => {
    if (!editingReport) return;

    startTransition(() => {
      setEditScore(
        typeof editingReport.score === "number" ? editingReport.score : 0,
      );
      setEditHighlights(
        Array.isArray(editingReport.highlights)
          ? editingReport.highlights.join(", ")
          : String(editingReport.highlights ?? ""),
      );
      setEditSummary(String(editingReport.summary ?? ""));
    });
  }, [editingReport]);

  useEffect(() => {
    startTransition(() =>
      setSelectedStatus(candidateProfileQuery.data?.status ?? null),
    );
  }, [candidateProfileQuery.data?.status]);

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newStatus = e.target.value as CandidateStatuses | null;

    if (!newStatus) return;

    if (CANDIDATE_STATUSES.includes(newStatus)) {
      setPendingStatus(newStatus);
      setShowScheduleModal(true);
      return;
    }

    try {
      await updateCandidateStatusMutation.mutateAsync({
        applicantId: candidateId,
        newStatus,
      });

      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: `Candidate moved to ${newStatus}`,
        confirmButtonColor: "#E30022",
      });

      // No need to refetch entire profile, just update status locally. Reduce unnecessary network request and UI flicker.
      setSelectedStatus(newStatus);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  };

  const candidate = candidateProfileQuery.data;
  const contactItems = [
    ...(candidateProfileQuery.data?.socialLinks ?? []).map((link) =>
      getLinkMeta(link),
    ),
  ];
  const handleDeleteReport = (reportId: string) => {
    if (confirm("Are you sure you want to delete this HR evaluation?")) {
      deleteHRReportMutation.mutate(
        { reportId, staffId: getHRReportsQuery.data?.[0]?.staff_id || "" },
        {
          onSuccess: () => {
            swalSuccess(
              "Deleted Successfully",
              "HR evaluation deleted successfully.",
            );
            getHRReportsQuery.refetch();
          },
          onError: (error: unknown) => {
            swalError(
              "Something went wrong",
              error instanceof Error ? error.message : String(error),
            );
          },
        },
      );
    }
  };

  const handleEditReport = (index: number) => {
    setEditingIndex(index);
  };

  const handleSaveEdit = () => {
    if (!editingReport) return;

    updateHRReportMutation.mutate(
      {
        reportId: editingReport.id,
        staffId: editingReport.staff_id,
        score: Number.isFinite(editScore) ? editScore : 0,
        keyHighlights: editHighlights,
        summary: editSummary,
      },
      {
        onSuccess: () => {
          swalSuccess(
            "Update Successful",
            "HR evaluation updated successfully.",
          );
          setEditingIndex(null);
          getHRReportsQuery.refetch();
        },
        onError: (error: unknown) => {
          swalError(
            "Update Failed",
            error instanceof Error ? error.message : String(error),
          );
        },
      },
    );
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  if (!isAuthenticated) {
    return (
      <main className="bg-linear-to-br from-red-50 via-white to-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white/80 rounded-2xl shadow-xl px-8 py-12 flex flex-col items-center max-w-md w-full border border-red-100">
          <svg
            className="w-16 h-16 text-red-400 mb-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <title>Icon representing authentication required</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 11v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            You must be logged in to view this candidate profile.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
            type="button"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen p-6">
      <div className="container mx-auto max-w-6xl space-y-6">
        <div
          className="
            relative
            bg-white/40 
            backdrop-blur-2xl 
            border border-white/30 
            shadow-[0_10px_40px_rgba(0,0,0,0.08)] 
            rounded-3xl 
            p-8 
            flex 
            flex-row 
            items-center 
            justify-between
            gap-6
            overflow-hidden
          "
        >
          <div className="absolute inset-0 bg-linear-to-br from-red-100/40 via-white/10 to-red-50/30 pointer-events-none" />

          <div className="relative flex-1">
            <h2 className="text-3xl font-bold bg-linear-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
              {candidate
                ? `${candidate.user.firstName} ${candidate.user.lastName}`
                : "Loading..."}
            </h2>

            <div className="flex gap-2 text-red-500">
              {contactItems
                .filter((item): item is LinkMeta => Boolean(item))
                .map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={`${item.label}-${idx}`}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-xl mt-1 bg-white/40 backdrop-blur-md border border-white/40 shadow-sm hover:bg-red-600 hover:text-white transition-all duration-300 cursor-pointer"
                      aria-label={item.label}
                      title={item.label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
            </div>
          </div>
          <div className="relative flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="
                flex items-center gap-2
                text-gray-700
                hover:text-red-600
                transition-all
                font-medium
              "
            >
              <MdArrowBack className="text-lg" />
              <span>Back</span>
            </button>

            <select
              value={selectedStatus || ""}
              onChange={handleStatusChange}
              className="
                bg-white/40
                backdrop-blur-xl
                border border-white/40
                shadow-md
                text-red-700
                font-semibold
                px-4 py-2
                rounded-xl
                transition-all
                hover:shadow-lg
                focus:outline-none
                focus:ring-2
                focus:ring-red-400
              "
            >
              <option value="">Select Status</option>
              {CANDIDATE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div
              className="
                        relative
                        bg-white/40 
                        backdrop-blur-2xl 
                        border border-white/30 
                        shadow-[0_10px_40px_rgba(0,0,0,0.08)] 
                        rounded-3xl 
                        p-8 
                        flex 
                        flex-col 
                        items-center 
                        gap-6
                        overflow-hidden
                      "
            >
              <div className="absolute inset-0 bg-linear-to-br from-red-100/40 via-white/10 to-red-50/30 pointer-events-none" />

              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Schedule Details — {pendingStatus}
              </h2>

              <div className="space-y-4">
                <input
                  type="date"
                  className="w-full rounded-lg border border-white/40 bg-white/60 px-4 py-2 focus:outline-none"
                  value={scheduleData.date}
                  onChange={(e) =>
                    setScheduleData({
                      ...scheduleData,
                      date: e.target.value,
                    })
                  }
                />

                <input
                  type="time"
                  className="w-full rounded-lg border border-white/40 bg-white/60 px-4 py-2 focus:outline-none"
                  value={scheduleData.time}
                  onChange={(e) =>
                    setScheduleData({
                      ...scheduleData,
                      time: e.target.value,
                    })
                  }
                />

                <input
                  type="text"
                  placeholder="Location / Meeting Link"
                  className="w-full rounded-lg border border-white/40 bg-white/60 px-4 py-2 focus:outline-none"
                  value={scheduleData.location}
                  onChange={(e) =>
                    setScheduleData({
                      ...scheduleData,
                      location: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                  onClick={() => {
                    setShowScheduleModal(false);
                    setScheduleData({
                      date: "",
                      time: "",
                      location: "",
                    });
                  }}
                  type="button"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    setShowScheduleModal(false);

                    await updateCandidateStatusMutation.mutateAsync({
                      applicantId: candidateId,
                      newStatus: pendingStatus,
                    });

                    Swal.fire({
                      icon: "success",
                      title: "Scheduled Successfully",
                      html: `
																		<strong>Status:</strong> ${pendingStatus}<br/>
																		<strong>Date:</strong> ${scheduleData.date}<br/>
																		<strong>Time:</strong> ${scheduleData.time}<br/>
																		<strong>Location:</strong> ${scheduleData.location}
																	`,
                      confirmButtonColor: "#E30022",
                    });

                    setScheduleData({
                      date: "",
                      time: "",
                      location: "",
                    });
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition"
                  type="button"
                >
                  Save & Update
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-center gap-4 mb-6">
            <button
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition ${
                activeTab === "evaluation"
                  ? "bg-linear-to-r from-red-600 to-red-500 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab("evaluation")}
              type="button"
            >
              Candidate Evaluation
            </button>
            <button
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition ${
                activeTab === "resume"
                  ? "bg-linear-to-r from-red-600 to-red-500 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab("resume")}
              type="button"
            >
              Resume
            </button>
          </div>
          {activeTab === "evaluation" ? (
            <div className="flex flex-col gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full">
                <h3 className="font-semibold mb-2">AI Generated Report</h3>
                {candidateProfileQuery.data ? (
                  <CandidateProfile
                    candidateProfile={candidateProfileQuery.data}
                    id={candidateId}
                  />
                ) : (
                  <p className="text-gray-500 italic">Loading evaluation...</p>
                )}
              </div>

              <div
                className="
                  scroll-smooth
                  scrollbar-hide
                  bg-gray-50
                  p-4
                  rounded-lg
                  border border-gray-200
                  h-full
                  flex flex-col
                  gap-4
                  w-full
                  overflow-hidden
                "
              >
                <h3 className="font-semibold mb-2">HR Officer Report</h3>
                <div className="w-full flex justify-center mb-4">
                  <HRReport
                    onSubmit={(data) => {
                      createHRReportMutation.mutate(
                        {
                          ...data,
                          applicantId: candidateId,
                        },
                        {
                          onSuccess: () => {
                            getHRReportsQuery.refetch();
                            swalSuccess(
                              "Report Submitted",
                              "HR report submitted successfully.",
                            );
                          },
                          onError: (error) => {
                            swalError(
                              "Submission Failed",
                              error instanceof Error
                                ? error.message
                                : String(error),
                            );
                          },
                        },
                      );
                    }}
                  />
                </div>
                <div
                  className={[
                    "self-start",
                    "bg-white/60 backdrop-blur-2xl border border-white/40 rounded-3xl",
                    "shadow-[0_20px_60px_rgba(220,38,38,0.10)]",
                    "w-full",
                    "max-h-130 overflow-y-auto",
                    "p-6",
                  ].join(" ")}
                >
                  {hasReports ? (
                    <div className="grid gap-4">
                      {hrReportsData.map((report, idx) => (
                        <div
                          key={report.id}
                          className="
                            relative
                            bg-white/60
                            backdrop-blur-2xl
                            border border-white/40
                            rounded-3xl
                            shadow-[0_20px_60px_rgba(220,38,38,0.10)]
                            p-6
                            transition-all duration-300
                            hover:shadow-[0_25px_70px_rgba(220,38,38,0.18)]
                          "
                        >
                          <div className="relative flex items-start justify-between gap-4 mb-4">
                            <div className="min-w-0">
                              <p className="text-xs uppercase tracking-widest text-gray-500">
                                HR Officer
                              </p>
                              <h3 className="text-lg font-semibold text-gray-800 truncate">
                                {report.staff_name}
                              </h3>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="px-3 py-1 bg-red-600/10 text-red-600 text-sm font-semibold rounded-full whitespace-nowrap">
                                {report.score != null
                                  ? Number.isInteger(report.score)
                                    ? report.score
                                    : report.score.toFixed(1)
                                  : 0}{" "}
                                / 5
                              </div>

                              {report.staff_id === userId && (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleEditReport(idx)}
                                    className="
                                      p-2 rounded-xl
                                      bg-white/70 backdrop-blur-md
                                      border border-white/40
                                      text-blue-600
                                      hover:bg-blue-600 hover:text-white
                                      transition-all duration-200
                                    "
                                  >
                                    <FiEdit2 size={16} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteReport(report.id)
                                    }
                                    className="
                                      p-2 rounded-xl
                                      bg-white/70 backdrop-blur-md
                                      border border-white/40
                                      text-red-600
                                      hover:bg-red-600 hover:text-white
                                      transition-all duration-200
                                    "
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="relative flex gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={`${report.id}-star-${i}`}
                                className={`w-5 h-5 ${
                                  i < Math.round(report.score || 0)
                                    ? "text-yellow-400 drop-shadow-sm"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <title>Star Rating</title>
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.184 3.642a1 1 0 00.95.69h3.813c.969 0 1.371 1.24.588 1.81l-3.087 2.243a1 1 0 00-.364 1.118l1.184 3.642c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.087 2.243c-.785.57-1.84-.197-1.54-1.118l1.184-3.642a1 1 0 00-.364-1.118L3.106 9.07c-.783-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.184-3.642z" />
                              </svg>
                            ))}
                          </div>

                          <div className="relative mb-5">
                            <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">
                              Key Highlights
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {report.highlights.map((highlight, i) => (
                                <span
                                  key={`${report.id}-highlight-${i}`}
                                  className="
                                    px-3 py-1.5 text-xs font-medium
                                    rounded-full
                                    bg-white/70 backdrop-blur-md
                                    border border-white/40
                                    text-gray-700
                                  "
                                >
                                  {highlight}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="relative mb-4">
                            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                              Summary
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {report.summary}
                            </p>
                          </div>

                          <div className="relative text-xs text-gray-400 pt-3 border-t border-white/30">
                            Submitted on {formatDate(report.created_at)}
                          </div>

                          {editingIndex === idx &&
                            report.staff_id === userId && (
                              <div
                                className="
                              mt-6 p-6
                              bg-white/70 backdrop-blur-xl
                              border border-white/40
                              rounded-2xl
                              shadow-inner
                            "
                              >
                                <h4 className="font-semibold mb-4 text-gray-800">
                                  Edit HR Evaluation
                                </h4>

                                <div className="grid gap-4">
                                  <div>
                                    <label
                                      htmlFor="score"
                                      className="block text-sm font-semibold mb-2"
                                    >
                                      Score (1.0 - 5.0)
                                    </label>
                                    <input
                                      id="score"
                                      type="text"
                                      inputMode="decimal"
                                      value={editScore === 0 ? "" : editScore}
                                      onChange={(e) => {
                                        const value = e.target.value;

                                        if (value === "") {
                                          setEditScore(0);
                                          return;
                                        }

                                        if (!/^\d*\.?\d*$/.test(value)) return;

                                        const numericValue = Number(value);

                                        if (value.endsWith(".")) {
                                          setEditScore(
                                            value as unknown as number,
                                          );
                                          return;
                                        }

                                        if (
                                          numericValue >= 1 &&
                                          numericValue <= 5
                                        ) {
                                          setEditScore(numericValue);
                                        }
                                      }}
                                      onBlur={() => {
                                        if (typeof editScore === "number") {
                                          if (editScore < 1) setEditScore(1);
                                          if (editScore > 5) setEditScore(5);
                                        }
                                      }}
                                      className="
                                    w-full
                                    px-4 py-2.5
                                    rounded-xl
                                    bg-white/60
                                    backdrop-blur-md
                                    border border-white/40
                                    focus:outline-none
                                    focus:ring-2 focus:ring-red-400/50
                                    transition
                                  "
                                    />
                                  </div>

                                  <div>
                                    <label
                                      htmlFor="highlights"
                                      className="block text-sm font-semibold mb-2"
                                    >
                                      Key Highlights
                                    </label>
                                    <textarea
                                      id="highlights"
                                      value={editHighlights}
                                      onChange={(e) =>
                                        setEditHighlights(e.target.value)
                                      }
                                      rows={3}
                                      className="
                                    w-full
                                    px-4 py-2 rounded-xl
                                    bg-white/80 backdrop-blur-md
                                    border border-red-200
                                    focus:ring-2 focus:ring-red-400/40
                                    transition
                                  "
                                    />
                                  </div>

                                  <div>
                                    <label
                                      htmlFor="summary"
                                      className="block text-sm font-semibold mb-2"
                                    >
                                      Summary Evaluation
                                    </label>
                                    <textarea
                                      id="summary"
                                      value={editSummary}
                                      onChange={(e) =>
                                        setEditSummary(e.target.value)
                                      }
                                      rows={3}
                                      className="
                                    w-full
                                    px-4 py-2 rounded-xl
                                    bg-white/80 backdrop-blur-md
                                    border border-red-200
                                    focus:ring-2 focus:ring-red-400/40
                                    transition
                                  "
                                    />
                                  </div>

                                  <div className="flex justify-end gap-3">
                                    <button
                                      type="button"
                                      onClick={handleCancelEdit}
                                      className="
                                    px-5 py-2 rounded-xl
                                    bg-white/70 backdrop-blur-md
                                    border border-white/40
                                    hover:bg-gray-200/50
                                    transition
                                  "
                                      disabled={
                                        updateHRReportMutation.isPending
                                      }
                                    >
                                      Cancel
                                    </button>

                                    <button
                                      type="button"
                                      onClick={handleSaveEdit}
                                      className="
                                    px-6 py-2 rounded-xl
                                    bg-linear-to-r from-red-600 to-red-500
                                    text-white font-semibold
                                    shadow-md
                                    hover:scale-105
                                    transition-all
                                  "
                                      disabled={
                                        updateHRReportMutation.isPending
                                      }
                                    >
                                      {updateHRReportMutation.isPending
                                        ? "Saving..."
                                        : "Save"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-center mt-4">
                      No HR evaluations yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                className="
                  relative
                  bg-white/40 
                  backdrop-blur-2xl 
                  border border-white/30 
                  shadow-[0_10px_40px_rgba(0,0,0,0.08)] 
                  rounded-3xl 
                  p-8 
                  flex 
                  flex-col 
                  items-center 
                  gap-6
                  overflow-hidden
                "
              >
                <div className="absolute inset-0 bg-linear-to-br from-red-100/40 via-white/10 to-red-50/30 pointer-events-none" />

                <CandidateResume
                  candidateProfile={candidateProfileQuery.data}
                />
              </div>

              <div className="w-full max-w-3xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Scored Skills
                  </p>
                  <div className="px-3 py-1 rounded-full bg-white/50 backdrop-blur-md border border-white/40 text-xs font-semibold text-gray-700">
                    Out of 5
                  </div>
                </div>

                {candidateProfileQuery.data?.skills?.map((item) => {
                  const pct = Math.max(
                    0,
                    Math.min(100, (item.rating / 5) * 100),
                  );

                  return (
                    <div
                      key={`${item.name}-${item.rating}`}
                      className="
                        mb-3
                        rounded-2xl
                        bg-white/45
                        backdrop-blur-xl
                        border border-white/40
                        shadow-[0_10px_30px_rgba(227,0,34,0.10)]
                        p-4
                        transition
                        hover:bg-white/60
                      "
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Applicant Self-Assessment Score
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-3">
                          <div className="px-3 py-1 rounded-full bg-red-600/10 text-red-600 text-sm font-bold border border-white/30 whitespace-nowrap">
                            {item.rating.toFixed(1)} / 5
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="h-2 rounded-full bg-white/50 border border-white/40 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-red-600 to-red-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                          <span>0</span>
                          <span>2.5</span>
                          <span>5</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
