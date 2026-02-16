"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Select from "react-select";
import useAuth from "@/hooks/useAuth";
import { formatDate } from "@/lib/library";
import { trpc } from "@/lib/trpc/client";
import type { AdminFeedback } from "@/types/schema";

interface WorkExperience {
  company: string;
  start_date?: Date;
  title: string;
  end_date?: Date;
}

interface CandidateID {
  userId?: string;
  applicantId?: string;
}

export default function ComparePage() {
  const router = useRouter();
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [candidateA, setCandidateA] = useState<CandidateID>({});
  const [candidateB, setCandidateB] = useState<CandidateID>({});

  const [adminFeedbackA, setAdminFeedbackA] = useState<string>("");
  const [adminFeedbackB, setAdminFeedbackB] = useState<string>("");
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(
    null,
  );
  const [editedFeedback, setEditedFeedback] = useState("");
  const [showAdminFeedbackFields, setShowAdminFeedbackFields] = useState(false);

  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    alert("You are not authorized to access this page.");
    router.push("/login");
  }

  const fetchJobsQuery = trpc.admin.fetchAllJobs.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const AIQuery = trpc.candidate.fetchAICompare.useQuery(
    {
      userId_A: candidateA.userId ?? "",
      userId_B: candidateB.userId ?? "",
      jobId: selectedJobId,
    },
    {
      enabled: !!candidateA.userId && !!candidateB.userId,
    },
  );

  const candidatesQuery = trpc.candidate.getCandidatesFromJob.useQuery(
    {
      jobId: selectedJobId,
    },
    {
      enabled: !!selectedJobId && isAuthenticated,
    },
  );

  const candidateDataA = trpc.candidate.fetchCandidateProfile.useQuery(
    {
      candidateId: candidateA.applicantId ?? "",
      fetchResume: true,
      fetchScore: true,
      fetchTranscribed: true,
    },
    {
      enabled: !!candidateA.applicantId,
    },
  );

  const candidateDataB = trpc.candidate.fetchCandidateProfile.useQuery(
    {
      candidateId: candidateB.applicantId ?? "",
      fetchResume: true,
      fetchScore: true,
      fetchTranscribed: true,
    },
    {
      enabled: !!candidateB.applicantId,
    },
  );

  const adminFeedbacksQuery = trpc.candidate.fetchAdminFeedbacks.useQuery(
    {
      candidateAId: candidateA.applicantId ?? "",
      candidateBId: candidateB.applicantId ?? "",
    },
    {
      enabled: !!candidateA.applicantId && !!candidateB.applicantId,
    },
  );

  const postAdminFeedbackMutation =
    trpc.candidate.createAdminFeedback.useMutation();
  const deleteAdminFeedbackMutation =
    trpc.candidate.deleteAdminFeedback.useMutation();
  const updateAdminFeedbackMutation =
    trpc.candidate.updateAdminFeedback.useMutation({
      onSuccess: () => {
        setEditingFeedbackId(null);
        adminFeedbacksQuery.refetch();
      },
    });

  const handleSubmitFeedback = () => {
    if (!isAuthenticated) {
      return;
    }

    if (adminFeedbackA.trim()) {
      postAdminFeedbackMutation.mutate({
        candidateId: candidateA.applicantId ?? "",
        feedback: adminFeedbackA.trim(),
      });
      setAdminFeedbackA("");
    }

    if (adminFeedbackB.trim()) {
      postAdminFeedbackMutation.mutate({
        candidateId: candidateB.applicantId ?? "",
        feedback: adminFeedbackB.trim(),
      });
      setAdminFeedbackB("");
    }

    setShowAdminFeedbackFields(false);
  };

  const handleDeleteFeedback = (feedbackId: string) => {
    if (!isAuthenticated) {
      alert("You are not authorized to perform this action.");
      router.push("/login");
      return;
    }

    if (confirm("Are you sure you want to delete this feedback?")) {
      deleteAdminFeedbackMutation.mutate(
        { feedbackId },
        { onSuccess: () => adminFeedbacksQuery.refetch() },
      );
    }
  };

  const handleEditClick = (
    post: AdminFeedback & {
      admin: { last_name: string; first_name: string };
      applicant: { user: { last_name: string; first_name: string } };
    },
  ) => {
    setEditingFeedbackId(post.id);
    setEditedFeedback(post.feedback);
  };

  const handleSaveEdit = (id: string) => {
    if (!editedFeedback.trim()) {
      alert("Feedback cannot be empty.");
      return;
    }

    updateAdminFeedbackMutation.mutate({
      feedbackId: id,
      newFeedback: editedFeedback.trim(),
    });
  };

  // Add stable ids to associate labels with react-select inputs
  const jobSelectId = "job-select";
  const candidateASelectId = "candidate-a-select";
  const candidateBSelectId = "candidate-b-select";

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center">
      <div className="w-full max-w-7xl">
        <div className="bg-white/60 backdrop-blur-md border border-gray-200 rounded-3xl shadow-lg p-8 space-y-8">
          <h2 className="text-3xl font-bold text-gray-800 text-center">
            Compare Candidates
          </h2>

          <div>
            <label
              htmlFor={jobSelectId}
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Select Job
            </label>

            {fetchJobsQuery.isLoading || fetchJobsQuery.isFetching ? (
              <div className="w-full p-3 border rounded-xl bg-white/50 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
                <span className="text-sm text-gray-500">Loading jobs...</span>
              </div>
            ) : (
              <Select
                inputId={jobSelectId}
                instanceId={jobSelectId}
                options={fetchJobsQuery.data?.jobs?.map((job) => ({
                  value: job.id,
                  label: job.title,
                }))}
                value={
                  selectedJobId
                    ? {
                        value: selectedJobId,
                        label: fetchJobsQuery.data?.jobs?.find(
                          (j) => j.id === selectedJobId,
                        )?.title,
                      }
                    : null
                }
                onChange={(option) => setSelectedJobId(option?.value || "")}
                placeholder="-- Select Job --"
                isClearable
                className="w-full"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    borderColor: "rgba(0,0,0,0.2)",
                    backgroundColor: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(8px)",
                    color: "#333",
                  }),
                  singleValue: (provided) => ({ ...provided, color: "#333" }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(8px)",
                    color: "#333",
                  }),
                }}
              />
            )}
          </div>

          {selectedJobId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidatesQuery.isLoading || candidatesQuery.isFetching ? (
                <div className="col-span-2 text-center text-gray-500">
                  Loading candidates...
                </div>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor={candidateASelectId}
                      className="block text-sm font-medium text-gray-600 mb-2"
                    >
                      Candidate A
                    </label>
                    <Select
                      inputId={candidateASelectId}
                      instanceId={candidateASelectId}
                      options={candidatesQuery.data?.applicants.map((c) => ({
                        value: { userId: c.user_id, applicantId: c.id },
                        label: c.name,
                      }))}
                      value={
                        candidateA.userId
                          ? {
                              value: candidateA,
                              label: candidatesQuery.data?.applicants.find(
                                (c) => c.user_id === candidateA.userId,
                              )?.name,
                            }
                          : null
                      }
                      onChange={(option) => setCandidateA(option?.value ?? {})}
                      placeholder="-- Select Candidate A --"
                      isClearable
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={candidateBSelectId}
                      className="block text-sm font-medium text-gray-600 mb-2"
                    >
                      Candidate B
                    </label>
                    <Select
                      inputId={candidateBSelectId}
                      instanceId={candidateBSelectId}
                      options={candidatesQuery.data?.applicants.map((c) => ({
                        value: { userId: c.user_id, applicantId: c.id },
                        label: c.name,
                      }))}
                      value={
                        candidateB.userId
                          ? {
                              value: candidateB,
                              label: candidatesQuery.data?.applicants.find(
                                (c) => c.user_id === candidateB.userId,
                              )?.name,
                            }
                          : null
                      }
                      onChange={(option) => setCandidateB(option?.value ?? {})}
                      placeholder="-- Select Candidate B --"
                      isClearable
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {candidateA.applicantId && candidateB.applicantId && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 items-center">
              {[candidateDataA, candidateDataB].map((data, idx) => (
                <div
                  key={crypto.randomUUID()}
                  className="p-6 bg-white/40 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md space-y-3"
                >
                  <h3 className="text-xl font-semibold text-gray-800">
                    {data.data?.user.firstName} {data.data?.user.lastName}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    {
                      fetchJobsQuery.data?.jobs?.find(
                        (job) => job.id === selectedJobId,
                      )?.title
                    }
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    {
                      candidatesQuery.data?.applicants.find(
                        (c) =>
                          c.id ===
                          (idx === 0
                            ? candidateA.applicantId
                            : candidateB.applicantId),
                      )?.email
                    }
                  </p>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Experience:</strong>{" "}
                      {data.data?.parsedResume?.raw_output?.work_experience
                        .map((exp: WorkExperience) => exp.title)
                        .join(", ") || "N/A"}
                    </p>
                    <p>
                      <strong>Education:</strong>{" "}
                      {data.data?.parsedResume?.raw_output
                        ?.educational_background[0].degree || "N/A"}
                    </p>
                    <p>
                      <strong>Skills:</strong>{" "}
                      {data.data?.parsedResume?.raw_output?.soft_skills.map(
                        (skill: string) => (
                          <span
                            key={skill}
                            className="inline-block bg-gray-200/30 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1"
                          >
                            {skill}
                          </span>
                        ),
                      )}
                    </p>
                    <p>
                      <strong>Match Score:</strong>{" "}
                      <span
                        className={`font-semibold ${
                          data.data?.score?.score_data?.predictive_success >= 85
                            ? "text-green-600"
                            : data.data?.score?.score_data
                                  ?.predictive_success >= 70
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {data.data?.score?.score_data?.predictive_success}%
                      </span>
                    </p>
                  </div>
                </div>
              ))}
              <div className="text-gray-500 text-4xl font-bold text-center">
                VS
              </div>
            </div>
          )}

          <div className="mt-6 space-y-6">
            <div>
              <div className="block text-sm font-medium text-gray-600 mb-2">
                AI Feedback
              </div>

              {AIQuery.isLoading || AIQuery.isFetching ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-20 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-10 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-12 bg-gray-200 rounded" />{" "}
                </div>
              ) : AIQuery.data ? (
                <>
                  <h1 className="text-xl mb-2">
                    {" "}
                    Better Candidate:{" "}
                    <b className="text-red-600">
                      {" "}
                      {AIQuery.data.better_candidate}{" "}
                    </b>
                  </h1>
                  <h3>
                    <b>Reason</b>
                  </h3>
                  <textarea
                    readOnly
                    value={AIQuery.data.reason}
                    className="w-full p-3 border rounded-md bg-gray-100 text-gray-500"
                    rows={4}
                  ></textarea>
                  <h3>
                    <b>Highlights</b>
                  </h3>
                  <textarea
                    readOnly
                    value={AIQuery.data.highlights}
                    className="w-full p-3 border rounded-md bg-gray-100 text-gray-500"
                    rows={2}
                  />
                  <h3>
                    <b>Recommendations</b>
                  </h3>
                  <textarea
                    readOnly
                    value={AIQuery.data.recommendations}
                    className="w-full p-3 border rounded-md bg-gray-100 text-gray-500"
                    rows={3}
                  />
                </>
              ) : (
                <div className="text-gray-400">No AI feedback available.</div>
              )}
            </div>

            {candidateA.userId && candidateB.userId && (
              <div className="mt-6">
                <button
                  className="px-6 py-2 bg-gray-200/50 hover:bg-gray-300/50 rounded-xl backdrop-blur-sm font-semibold transition text-gray-800"
                  onClick={() => setShowAdminFeedbackFields((prev) => !prev)}
                  type="button"
                >
                  {showAdminFeedbackFields
                    ? "Hide Admin Feedback"
                    : "Add Admin Feedback"}
                </button>
              </div>
            )}

            {showAdminFeedbackFields && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea
                  value={adminFeedbackA}
                  onChange={(e) => setAdminFeedbackA(e.target.value)}
                  placeholder="Enter feedback for Candidate A"
                  className="w-full p-3 bg-white/40 backdrop-blur-sm border border-gray-200 text-gray-800 rounded-xl placeholder-gray-500"
                  rows={4}
                />
                <textarea
                  value={adminFeedbackB}
                  onChange={(e) => setAdminFeedbackB(e.target.value)}
                  placeholder="Enter feedback for Candidate B"
                  className="w-full p-3 bg-white/40 backdrop-blur-sm border border-gray-200 text-gray-800 rounded-xl placeholder-gray-500"
                  rows={4}
                />
                <button
                  className="px-6 py-2 bg-gray-200/50 hover:bg-gray-300/50 rounded-xl backdrop-blur-sm font-semibold text-gray-800"
                  onClick={handleSubmitFeedback}
                  type="button"
                >
                  Submit Feedback
                </button>
              </div>
            )}

            <div className="mt-6 space-y-4">
              {adminFeedbacksQuery.data?.adminFeedbacks.map(
                (
                  post: AdminFeedback & {
                    admin: { last_name: string; first_name: string };
                    applicant: {
                      user: { last_name: string; first_name: string };
                    };
                  },
                ) => (
                  <div
                    key={crypto.randomUUID()}
                    className="p-4 bg-white/40 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm"
                  >
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>
                        {post.admin.first_name} {post.admin.last_name}
                      </span>
                      <span>{formatDate(post.created_at)}</span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <strong className="text-sm">
                          Candidate {post.applicant.user.first_name}{" "}
                          {post.applicant.user.last_name}:
                        </strong>

                        {editingFeedbackId === post.id ? (
                          <div className="mt-2 space-y-2">
                            <textarea
                              value={editedFeedback}
                              onChange={(e) =>
                                setEditedFeedback(e.target.value)
                              }
                              className="w-full p-2 bg-white/40 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-800 text-sm"
                              rows={3}
                            />
                            <div className="flex gap-2 mt-1">
                              <button
                                className="px-3 py-1 bg-red-500/50 hover:bg-red-600/50 text-white text-xs rounded"
                                onClick={() => handleSaveEdit(post.id)}
                                type="button"
                              >
                                Save
                              </button>
                              <button
                                className="px-3 py-1 bg-gray-200/50 hover:bg-gray-300/50 text-gray-800 text-xs rounded"
                                onClick={() => {
                                  setEditingFeedbackId(null);
                                  setEditedFeedback("");
                                }}
                                type="button"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 mt-1 text-sm">
                            {post.feedback}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          className="p-1 rounded hover:bg-gray-100 transition"
                          onClick={() => handleEditClick(post)}
                          title="Edit feedback"
                          type="button"
                        >
                          <Pencil className="w-4 h-4 text-red-500" />
                        </button>
                        <button
                          className="p-1 rounded hover:bg-gray-200 transition"
                          onClick={() => handleDeleteFeedback(post.id)}
                          title="Delete feedback"
                          type="button"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
