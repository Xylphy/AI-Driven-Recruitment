"use client";

import { FaFacebook, FaInstagram } from "react-icons/fa";
import { MdEmail, MdPhone, MdArrowBack } from "react-icons/md";
import Link from "next/link";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Image from "next/image";
import { startTransition, useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { CANDIDATE_STATUSES } from "@/lib/constants";
import dynamic from "next/dynamic";
import HRReport from "@/components/admin/candidateProfile/HRReport";

type CandidateStatus = (typeof CANDIDATE_STATUSES)[number];

const CandidateProfile = dynamic(
  () => import("@/components/admin/candidateProfile/CandidateProfile"),
  { ssr: false }
);

const CandidateResume = dynamic(
  () => import("@/components/admin/candidateProfile/CandidateResume"),
  { ssr: false }
);

export default function Page() {
  const router = useRouter();
  const candidateId = useParams().id as string;
  const { isAuthenticated } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<CandidateStatus | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"evaluation" | "resume">(
    "evaluation"
  );

  const [hrReports, setHRReports] = useState<
    {
      score: number;
      highlights: string;
      summary: string;
      reporter: string;
      date: string;
    }[]
  >([]);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const userJWT = trpc.auth.decodeJWT.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const candidateProfileQuery = trpc.candidate.fetchCandidateProfile.useQuery(
    {
      candidateId,
      fetchScore: true,
      fetchTranscribed: true,
      fetchResume: true,
    },
    { enabled: isAuthenticated && userJWT.data?.user.role !== "User" }
  );

  const updateCandidateStatusMutation =
    trpc.candidate.updateCandidateStatus.useMutation();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!userJWT.data?.user.role) {
      alert("You are not authorized to view this page.");
      router.back();
    }
  }, [userJWT.data?.user.role, isAuthenticated, router]);

  useEffect(() => {
    startTransition(() =>
      setSelectedStatus(candidateProfileQuery.data?.status ?? null)
    );
  }, [candidateProfileQuery.data?.status]);

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value as CandidateStatus | null;
    const oldStatus = selectedStatus;

    setSelectedStatus(newStatus);
    await updateCandidateStatusMutation.mutateAsync(
      {
        applicantId: candidateId,
        newStatus,
      },
      {
        onSuccess: () => {
          alert("Candidate status updated successfully.");
        },
        onError: (error: unknown) => {
          alert(error instanceof Error ? error.message : String(error));
          setSelectedStatus(oldStatus);
        },
      }
    );
  };

  const candidate = candidateProfileQuery.data;

  const handleDeleteReport = (index: number) => {
    if (confirm("Are you sure you want to delete this HR evaluation?")) {
      setHRReports((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleEditReport = (index: number) => {
    setEditingIndex(index);
  };

  return (
    <main className="bg-gray-50 min-h-screen p-6">
      <div className="container mx-auto max-w-6xl space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 cursor-pointer"
        >
          <MdArrowBack className="text-xl" />
          <span>Back to Candidate List</span>
        </button>
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center gap-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden">
            <Image
              src="/logo.png"
              alt="Profile"
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>

          <h2 className="text-xl font-semibold text-center">
            {candidate
              ? `${candidate.user.firstName} ${candidate.user.lastName}`
              : "Loading..."}
          </h2>

          <div className="flex gap-3 text-red-600">
            <MdEmail className="w-6 h-6" />
            <FaFacebook className="w-5 h-5" />
            <FaInstagram className="w-5 h-5" />
            <MdPhone className="w-6 h-6" />
          </div>

          <div className="w-full max-w-sm">
            <div className="flex justify-center mt-4">
              <select
                value={selectedStatus || ""}
                onChange={handleStatusChange}
                className="bg-red-100 text-red-700 font-semibold px-3 py-1.5 rounded border border-red-200 transition-all hover:bg-red-200 hover:text-red-800 w-48 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
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
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setActiveTab("evaluation")}
              className={`px-4 py-2 rounded font-semibold transition ${
                activeTab === "evaluation"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Candidate Evaluation
            </button>
            <button
              onClick={() => setActiveTab("resume")}
              className={`px-4 py-2 rounded font-semibold transition ${
                activeTab === "resume"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Resume
            </button>
          </div>

          {activeTab === "evaluation" ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full overflow-auto">
                <h3 className="font-semibold mb-2">AI Generated Report</h3>
                {candidateProfileQuery.data ? (
                  <CandidateProfile
                    candidateProfile={candidateProfileQuery.data}
                  />
                ) : (
                  <p className="text-gray-500 italic">Loading evaluation...</p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full flex flex-col gap-4">
                <h3 className="font-semibold mb-2">HR Officer Report</h3>
                <div className="w-full flex justify-center mb-4">
                  <HRReport
                    candidateId={candidateId}
                    onSubmit={(data) =>
                      setHRReports((prev) => [
                        {
                          ...data,
                          reporter:
                            userJWT.data?.user.firstName +
                            " " +
                            userJWT.data?.user.lastName,
                          date: new Date().toLocaleString(),
                        },
                        ...prev,
                      ])
                    }
                  />
                </div>

                {hrReports.length > 0 ? (
                  <div className="flex flex-col gap-4 w-full overflow-auto">
                    {hrReports.map((report, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-4 rounded-lg shadow-md border border-gray-200 w-full relative flex flex-col gap-2"
                      >
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={() => handleEditReport(idx)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteReport(idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                        <p>
                          <span className="font-semibold text-gray-700">
                            Score:
                          </span>{" "}
                          <span className="text-red-600 font-bold">
                            <div className="flex items-center space-x-2">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-5 h-5 ${
                                    i < Math.floor(report.score || 0)
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.184 3.642a1 1 0 00.95.69h3.813c.969 0 1.371 1.24.588 1.81l-3.087 2.243a1 1 0 00-.364 1.118l1.184 3.642c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.087 2.243c-.785.57-1.84-.197-1.54-1.118l1.184-3.642a1 1 0 00-.364-1.118L3.106 9.07c-.783-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.184-3.642z" />
                                </svg>
                              ))}
                              <span className="text-sm text-red-600">
                                ({report.score || 0}/5)
                              </span>
                            </div>
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold text-gray-700">
                            Highlights:
                          </span>{" "}
                          <br />
                          {report.highlights}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-700">
                            Summary:
                          </span>{" "}
                          <br />
                          {report.summary}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          <em>
                            Report by {report.reporter} on {report.date}
                          </em>
                        </p>
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
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full overflow-auto">
              <CandidateResume candidateProfile={candidateProfileQuery.data} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
