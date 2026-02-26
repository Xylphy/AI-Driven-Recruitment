"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Select from "react-select";
import useAuth from "@/hooks/useAuth";
import { formatDate } from "@/lib/library";
import { swalError, swalInfo } from "@/lib/swal";
import { trpc } from "@/lib/trpc/client";
import type { AdminFeedback } from "@/types/schema";
import type { FetchCandidateProfileOutput } from "@/types/types";

interface CandidateID {
  applicantId?: string;
}

function getExperienceCount(data: FetchCandidateProfileOutput | undefined) {
  return data?.parsedResume?.raw_output?.work_experience?.length || 0;
}

function getSkillsCount(data: FetchCandidateProfileOutput | undefined) {
  return data?.parsedResume?.raw_output?.soft_skills?.length || 0;
}

function getMatchScore(data: FetchCandidateProfileOutput | undefined) {
  return data?.score?.score_data?.job_fit_score || 0;
}

function compareMetric(a: number, b: number) {
  if (a > b * 1.1) return "A"; // Candidate A is significantly better
  if (b > a * 1.1) return "B"; // Candidate B is significantly better
  return "tie"; // Metrics are close enough to be considered a tie
}

// Add stable ids to associate labels with react-select inputs
const jobSelectId = "job-select";
const candidateASelectId = "candidate-a-select";
const candidateBSelectId = "candidate-b-select";

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

  const userInfo = trpc.auth.decodeJWT.useQuery();
  const role = userInfo.data?.user.role;

  const adminJobsQuery = trpc.admin.fetchJobs.useQuery(
    {},
    {
      enabled:
        (userInfo.isSuccess && role === "Admin") || role === "SuperAdmin",
    },
  );

  const hrOfficerJobsQuery = trpc.hrOfficer.assignedJobs.useQuery(
    {},
    {
      enabled: userInfo.isSuccess && role === "HR Officer",
    },
  );

  const jobsQuery =
    role === "Admin" || role === "SuperAdmin"
      ? adminJobsQuery
      : hrOfficerJobsQuery;

  const AIQuery = trpc.candidate.fetchAICompare.useQuery(
    {
      // biome-ignore lint/style/noNonNullAssertion: We check for applicantId existence before enabling this query
      userId_A: candidateA.applicantId!,
      // biome-ignore lint/style/noNonNullAssertion: We check for applicantId existence before enabling this query
      userId_B: candidateB.applicantId!,
      jobId: selectedJobId,
    },
    {
      enabled: !!candidateA.applicantId && !!candidateB.applicantId,
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

  const candidateAData = candidateDataA.data;
  const candidateBData = candidateDataB.data;

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
      swalInfo(
        "Login Required",
        "You must be logged in to use this feature.",
        () => router.push("/login"),
      );
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
      applicant: { last_name: string; first_name: string };
    },
  ) => {
    setEditingFeedbackId(post.id);
    setEditedFeedback(post.feedback);
  };

  const handleSaveEdit = (id: string) => {
    if (!editedFeedback.trim()) {
      swalError("Missing Feedback", "Please enter feedback before submitting.");
      return;
    }

    updateAdminFeedbackMutation.mutate({
      feedbackId: id,
      newFeedback: editedFeedback.trim(),
    });
  };

  return (
    <div className="min-h-screen p-8 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-red-100 via-white to-red-50 opacity-40 pointer-events-none" />
      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-red-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-200/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex justify-center">
        <div className="w-full max-w-7xl space-y-8">
          <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-3xl shadow-2xl p-8 md:p-10 space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-red-600 tracking-tight">
                Compare Candidates
              </h2>
              <p className="text-sm text-gray-600">
                Select a job, then compare two candidates side-by-side with AI
                and admin feedback.
              </p>
            </div>

            <div className="space-y-3">
              <label
                htmlFor={jobSelectId}
                className="block text-sm font-medium text-gray-700"
              >
                Select Job
              </label>

              {jobsQuery.isLoading || jobsQuery.isFetching ? (
                <div className="w-full p-4 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-md flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-red-100/70 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-3 bg-red-100/70 rounded w-3/4 animate-pulse mb-2" />
                    <div className="h-3 bg-red-100/70 rounded w-1/2 animate-pulse" />
                  </div>
                  <span className="text-sm text-gray-600">Loading jobs...</span>
                </div>
              ) : (
                <div
                  className="
                    sticky top-0 z-999
                    bg-white/75 backdrop-blur-2xl
                    border border-white/40
                    rounded-3xl
                    shadow-[0_20px_60px_rgba(0,0,0,0.10)]
                    p-6
                  "
                >
                  <div className="rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-md p-2">
                    <Select
                      inputId={jobSelectId}
                      instanceId={jobSelectId}
                      options={jobsQuery.data?.jobs?.map((job) => ({
                        value: job.id,
                        label: job.title,
                      }))}
                      value={
                        selectedJobId
                          ? {
                              value: selectedJobId,
                              label: jobsQuery.data?.jobs?.find(
                                (j) => j.id === selectedJobId,
                              )?.title,
                            }
                          : null
                      }
                      onChange={(option) =>
                        setSelectedJobId(option?.value || "")
                      }
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
                        singleValue: (provided) => ({
                          ...provided,
                          color: "#333",
                        }),
                        menu: (provided) => ({
                          ...provided,
                          backgroundColor: "rgba(255,255,255,0.6)",
                          backdropFilter: "blur(8px)",
                          color: "#333",
                        }),
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {selectedJobId && (
              <div
                className="
                  sticky top-0 z-50
                  bg-white/70 backdrop-blur-xl
                  border border-white/40
                  rounded-3xl
                  shadow-[0_20px_60px_rgba(0,0,0,0.08)]
                  p-4 md:p-6
                "
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {candidatesQuery.isLoading || candidatesQuery.isFetching ? (
                    <div className="md:col-span-2 text-center text-gray-600 bg-white/50 backdrop-blur-xl border border-white/40 rounded-2xl shadow-md p-6">
                      Loading candidates...
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <label
                          htmlFor={candidateASelectId}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Candidate A
                        </label>
                        <div className="rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-md p-2">
                          <Select
                            inputId={candidateASelectId}
                            instanceId={candidateASelectId}
                            options={candidatesQuery.data?.applicants.map(
                              (c) => ({
                                value: { applicantId: c.id },
                                label: c.name,
                              }),
                            )}
                            value={
                              candidateA.applicantId
                                ? {
                                    value: candidateA,
                                    label:
                                      candidatesQuery.data?.applicants.find(
                                        (c) => c.id === candidateA.applicantId,
                                      )?.name,
                                  }
                                : null
                            }
                            onChange={(option) =>
                              setCandidateA(option?.value ?? {})
                            }
                            placeholder="-- Select Candidate A --"
                            isClearable
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label
                          htmlFor={candidateBSelectId}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Candidate B
                        </label>
                        <div className="rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-md p-2">
                          <Select
                            inputId={candidateBSelectId}
                            instanceId={candidateBSelectId}
                            options={candidatesQuery.data?.applicants.map(
                              (c) => ({
                                value: { applicantId: c.id },
                                label: c.name,
                              }),
                            )}
                            value={
                              candidateB.applicantId
                                ? {
                                    value: candidateB,
                                    label:
                                      candidatesQuery.data?.applicants.find(
                                        (c) => c.id === candidateB.applicantId,
                                      )?.name,
                                  }
                                : null
                            }
                            onChange={(option) =>
                              setCandidateB(option?.value ?? {})
                            }
                            placeholder="-- Select Candidate B --"
                            isClearable
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {candidateA.applicantId && candidateB.applicantId && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {[candidateDataA, candidateDataB].map((data, idx) => (
                  <div
                    key={crypto.randomUUID()}
                    className="group p-6 bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl space-y-4 hover:scale-[1.02] transition-transform duration-300"
                  >
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {data.data?.user.firstName} {data.data?.user.lastName}
                      </h3>
                      <p className="text-gray-600">
                        {
                          jobsQuery.data?.jobs?.find(
                            (job) => job.id === selectedJobId,
                          )?.title
                        }
                      </p>
                      <p className="text-sm text-gray-500">
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
                    </div>

                    <div className="h-px bg-white/60" />

                    <div className="space-y-3 text-sm text-gray-700">
                      <p>
                        <span className="font-semibold text-gray-900">
                          Experience:
                        </span>{" "}
                        {data.data?.parsedResume?.raw_output?.work_experience
                          .map((exp) => exp.title)
                          .join(", ") || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-900">
                          Education:
                        </span>{" "}
                        {(data.data?.parsedResume?.raw_output
                          .educational_background[0]?.degree &&
                          data.data?.parsedResume?.raw_output
                            ?.educational_background[0].degree) ||
                          "N/A"}
                      </p>
                      <div>
                        <span className="font-semibold text-gray-900">
                          Skills:
                        </span>{" "}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {data.data?.parsedResume?.raw_output?.soft_skills.map(
                            (skill: string) => (
                              <span
                                key={skill}
                                className="inline-flex items-center rounded-full px-3 py-1 text-xs
                              bg-red-50/70 text-red-700 border border-red-100 backdrop-blur"
                              >
                                {skill}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                      <p>
                        <span className="font-semibold text-gray-900">
                          Match Score:
                        </span>{" "}
                        <span
                          className={`font-semibold ${
                            data.data?.score?.score_data?.job_fit_score &&
                            data.data?.score?.score_data?.job_fit_score >= 85
                              ? "text-green-600"
                              : data.data?.score?.score_data?.job_fit_score &&
                                  data.data?.score?.score_data?.job_fit_score >=
                                    70
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {data.data?.score?.score_data?.job_fit_score}%
                        </span>
                      </p>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-center rounded-2xl bg-white/40 backdrop-blur-xl border border-white/40 shadow-lg">
                  <div className="text-center">
                    <div className="text-5xl font-extrabold text-red-600/80 tracking-tight">
                      VS
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Side-by-side comparison
                    </div>
                  </div>
                </div>
              </div>
            )}

            {candidateA.applicantId && candidateB.applicantId && (
              <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl space-y-5">
                <h3 className="text-lg font-semibold text-gray-800">
                  Difference Highlights
                </h3>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-white/40">
                  <span className="text-sm font-medium text-gray-700">
                    Experience
                  </span>

                  <div className="text-sm">
                    {compareMetric(
                      getExperienceCount(candidateAData),
                      getExperienceCount(candidateBData),
                    ) === "A" && (
                      <span className="text-green-600 font-semibold">
                        Candidate A has more experience
                      </span>
                    )}
                    {compareMetric(
                      getExperienceCount(candidateAData),
                      getExperienceCount(candidateBData),
                    ) === "B" && (
                      <span className="text-blue-600 font-semibold">
                        Candidate B has more experience
                      </span>
                    )}
                    {compareMetric(
                      getExperienceCount(candidateAData),
                      getExperienceCount(candidateBData),
                    ) === "tie" && (
                      <span className="text-gray-600 font-semibold">
                        Equal experience
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-white/40">
                  <span className="text-sm font-medium text-gray-700">
                    Skills Count
                  </span>

                  <div className="text-sm">
                    {compareMetric(
                      getSkillsCount(candidateAData),
                      getSkillsCount(candidateBData),
                    ) === "A" && (
                      <span className="text-green-600 font-semibold">
                        Candidate A has more skills
                      </span>
                    )}
                    {compareMetric(
                      getSkillsCount(candidateAData),
                      getSkillsCount(candidateBData),
                    ) === "B" && (
                      <span className="text-blue-600 font-semibold">
                        Candidate B has more skills
                      </span>
                    )}
                    {compareMetric(
                      getSkillsCount(candidateAData),
                      getSkillsCount(candidateBData),
                    ) === "tie" && (
                      <span className="text-gray-600 font-semibold">
                        Equal skill count
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-white/40">
                  <span className="text-sm font-medium text-gray-700">
                    Match Score
                  </span>

                  <div className="text-sm">
                    {compareMetric(
                      getMatchScore(candidateAData),
                      getMatchScore(candidateBData),
                    ) === "A" && (
                      <span className="text-green-600 font-semibold">
                        Candidate A has higher match score
                      </span>
                    )}
                    {compareMetric(
                      getMatchScore(candidateAData),
                      getMatchScore(candidateBData),
                    ) === "B" && (
                      <span className="text-blue-600 font-semibold">
                        Candidate B has higher match score
                      </span>
                    )}
                    {compareMetric(
                      getMatchScore(candidateAData),
                      getMatchScore(candidateBData),
                    ) === "tie" && (
                      <span className="text-gray-600 font-semibold">
                        Same match score
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {candidateA.applicantId && candidateB.applicantId && (
                <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        AI Feedback
                      </div>
                      <div className="text-xs text-gray-500">
                        Generated summary once both candidates are selected.
                      </div>
                    </div>
                  </div>

                  {AIQuery.isLoading || AIQuery.isFetching ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-6 bg-red-100/70 rounded w-1/2 mb-2" />
                      <div className="h-4 bg-red-100/70 rounded w-1/3 mb-2" />
                      <div className="h-20 bg-red-100/70 rounded mb-2" />
                      <div className="h-4 bg-red-100/70 rounded w-1/4 mb-2" />
                      <div className="h-10 bg-red-100/70 rounded mb-2" />
                      <div className="h-4 bg-red-100/70 rounded w-1/4 mb-2" />
                      <div className="h-12 bg-red-100/70 rounded" />
                    </div>
                  ) : AIQuery.data ? (
                    <div className="space-y-4">
                      <h1 className="text-xl">
                        Better Candidate:{" "}
                        <b className="text-red-600">
                          {AIQuery.data.better_candidate}
                        </b>
                      </h1>

                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-800">
                          Reason
                        </h3>
                        <textarea
                          readOnly
                          value={AIQuery.data.reason}
                          className="w-full p-4 rounded-2xl bg-white/55 backdrop-blur-xl border border-white/40 shadow-sm
            text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/60"
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-800">
                          Highlights
                        </h3>
                        <textarea
                          readOnly
                          value={AIQuery.data.highlights}
                          className="w-full p-4 rounded-2xl bg-white/55 backdrop-blur-xl border border-white/40 shadow-sm
            text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/60"
                          rows={2}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl p-4">
                      No AI feedback available.
                    </div>
                  )}
                </div>
              )}
            </div>

            {candidateA.applicantId && candidateB.applicantId && (
              <div className="flex items-center justify-between gap-4">
                <button
                  className="flex items-center gap-2
                    px-6 py-2.5
                    rounded-xl
                    bg-linear-to-r from-red-600 to-red-500
                    text-white font-semibold
                    shadow-lg
                    hover:scale-105
                    transition-all duration-200"
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
              <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <textarea
                    value={adminFeedbackA}
                    onChange={(e) => setAdminFeedbackA(e.target.value)}
                    placeholder="Enter feedback for Candidate A"
                    className="w-full p-4 rounded-2xl bg-white/55 backdrop-blur-xl border border-white/40 shadow-sm
                    text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/60"
                    rows={4}
                  />
                  <textarea
                    value={adminFeedbackB}
                    onChange={(e) => setAdminFeedbackB(e.target.value)}
                    placeholder="Enter feedback for Candidate B"
                    className="w-full p-4 rounded-2xl bg-white/55 backdrop-blur-xl border border-white/40 shadow-sm
                    text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/60"
                    rows={4}
                  />
                </div>

                <div className="mt-4">
                  <button
                    className="bg-linear-to-r from-red-600 to-red-500 text-white font-bold
                    px-6 py-2 rounded-2xl shadow-lg hover:opacity-90 transition"
                    onClick={handleSubmitFeedback}
                    type="button"
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {adminFeedbacksQuery.data?.adminFeedbacks.map(
                (
                  post: AdminFeedback & {
                    admin: { last_name: string; first_name: string };
                    applicant: {
                      last_name: string;
                      first_name: string;
                    };
                  },
                ) => (
                  <div
                    key={crypto.randomUUID()}
                    className="p-5 bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg"
                  >
                    <div className="flex justify-between text-sm text-gray-600 mb-3">
                      <span className="font-medium">
                        {post.admin.first_name} {post.admin.last_name}
                      </span>
                      <span className="text-gray-500">
                        {formatDate(post.created_at)}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <strong className="text-sm text-gray-800">
                          Candidate {post.applicant.first_name}{" "}
                          {post.applicant.last_name}:
                        </strong>

                        {editingFeedbackId === post.id ? (
                          <div className="mt-3 space-y-2">
                            <textarea
                              value={editedFeedback}
                              onChange={(e) =>
                                setEditedFeedback(e.target.value)
                              }
                              className="w-full p-4 rounded-2xl bg-white/55 backdrop-blur-xl border border-white/40 shadow-sm
                              text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/60"
                              rows={3}
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                className="px-4 py-2 rounded-xl text-white text-xs font-semibold
                                bg-linear-to-r from-red-600 to-red-500 shadow-md hover:opacity-90 transition"
                                onClick={() => handleSaveEdit(post.id)}
                                type="button"
                              >
                                Save
                              </button>
                              <button
                                className="px-4 py-2 rounded-xl text-gray-800 text-xs font-semibold
                                bg-white/55 backdrop-blur-xl border border-white/40 shadow-sm hover:shadow-md transition"
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
                          <p className="text-gray-700 mt-2 text-sm leading-relaxed">
                            {post.feedback}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          className="p-2 rounded-xl bg-white/40 backdrop-blur border border-white/40
                          hover:bg-red-50/60 transition"
                          onClick={() => handleEditClick(post)}
                          title="Edit feedback"
                          type="button"
                        >
                          <Pencil className="w-4 h-4 text-red-500" />
                        </button>
                        <button
                          className="p-2 rounded-xl bg-white/40 backdrop-blur border border-white/40
                          hover:bg-red-50/60 transition"
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
