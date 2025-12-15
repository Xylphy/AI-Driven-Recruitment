"use client";

import useAuth from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Select from "react-select";

interface WorkExperience {
  company: string;
  start_date?: Date;
  title: string;
  end_date?: Date;
}

interface AdminFeedbackPost {
  author: string;
  content: string;
  timestamp: string;
  candidate: "A" | "B";
}

export default function ComparePage() {
  const router = useRouter();
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [candidateA_ID, setCandidateA] = useState<string>("");
  const [candidateB_ID, setCandidateB] = useState<string>("");

  // placeholder lang
  const [adminFeedbackA, setAdminFeedbackA] = useState<string>("");
  const [adminFeedbackB, setAdminFeedbackB] = useState<string>("");

  const [submittedFeedbackA, setSubmittedFeedbackA] = useState<string | null>(
    null
  );
  const [submittedFeedbackB, setSubmittedFeedbackB] = useState<string | null>(
    null
  );

  // New state for collapsible feedback and posts
  const [showAdminFeedbackFields, setShowAdminFeedbackFields] = useState(false);
  const [feedbackPosts, setFeedbackPosts] = useState<AdminFeedbackPost[]>([]);

  const { isAuthenticated } = useAuth();
  const jwtQuery = trpc.auth.decodeJWT.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const fetchJobsQuery = trpc.admin.fetchAllJobs.useQuery(undefined, {
    enabled: jwtQuery.data?.user.role !== "User",
  });

  const AIQuery = trpc.candidate.fetchAICompare.useQuery(
    {
      userId_A: candidateA_ID,
      userId_B: candidateB_ID,
      jobId: selectedJobId,
    },
    {
      enabled: !!candidateA_ID && !!candidateB_ID,
    }
  );

  useEffect(() => {
    if (jwtQuery.isFetched && !jwtQuery.data?.user.role) {
      alert("You are not authorized to access this page.");
      router.push("/profile");
    }
  }, [jwtQuery.isFetched, jwtQuery.data?.user.role, router]);

  const candidatesQuery = trpc.candidate.getCandidateFromJob.useQuery(
    {
      jobId: selectedJobId,
    },
    {
      enabled: !!selectedJobId && jwtQuery.data?.user.role !== "User",
    }
  );

  const candidateDataA = trpc.candidate.fetchCandidateProfile.useQuery(
    {
      candidateId: candidateA_ID,
      fetchResume: true,
      fetchScore: true,
      fetchTranscribed: true,
    },
    {
      enabled: !!candidateA_ID,
    }
  );

  const candidateDataB = trpc.candidate.fetchCandidateProfile.useQuery(
    {
      candidateId: candidateB_ID,
      fetchResume: true,
      fetchScore: true,
      fetchTranscribed: true,
    },
    {
      enabled: !!candidateB_ID,
    }
  );

  // placeholder lang
  const handleSubmitFeedback = () => {
    if (!jwtQuery.data?.user) return;

    const adminName = `${jwtQuery.data.user.firstName} ${jwtQuery.data.user.lastName}`;
    const timestamp = new Date().toLocaleString();

    if (adminFeedbackA.trim()) {
      setFeedbackPosts((prev) => [
        ...prev,
        {
          author: adminName,
          content: adminFeedbackA,
          timestamp,
          candidate: "A",
        },
      ]);
      setAdminFeedbackA("");
    }

    if (adminFeedbackB.trim()) {
      setFeedbackPosts((prev) => [
        ...prev,
        {
          author: adminName,
          content: adminFeedbackB,
          timestamp,
          candidate: "B",
        },
      ]);
      setAdminFeedbackB("");
    }

    setShowAdminFeedbackFields(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-red-600 mb-6">
        Compare Candidates
      </h2>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Select Job
        </label>

        {fetchJobsQuery.isLoading || fetchJobsQuery.isFetching ? (
          <div className="w-full p-3 border rounded-md bg-gray-50 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
            <span className="text-sm text-gray-500">Loading jobs...</span>
          </div>
        ) : (
          <Select
            options={fetchJobsQuery.data?.jobs?.map((job) => ({
              value: job.id,
              label: job.title,
            }))}
            value={
              selectedJobId
                ? {
                    value: selectedJobId,
                    label: fetchJobsQuery.data?.jobs?.find(
                      (j) => j.id === selectedJobId
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
                borderColor: "#E30022",
              }),
            }}
          />
        )}
      </div>
      {selectedJobId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {candidatesQuery.isLoading || candidatesQuery.isFetching ? (
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="w-full p-3 border rounded-md bg-gray-50 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
                <span className="text-sm text-gray-500">
                  Loading candidates...
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Select Candidate A
                  </label>
                  <select
                    disabled
                    className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
                  >
                    <option>Loading...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Select Candidate B
                  </label>
                  <select
                    disabled
                    className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
                  >
                    <option>Loading...</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Select Candidate A
                </label>
                <Select
                  options={candidatesQuery.data?.applicants.map(
                    (candidate) => ({
                      value: candidate.id,
                      label: candidate.name,
                    })
                  )}
                  value={
                    candidateA_ID
                      ? {
                          value: candidateA_ID,
                          label: candidatesQuery.data?.applicants.find(
                            (c) => c.id === candidateA_ID
                          )?.name,
                        }
                      : null
                  }
                  onChange={(option) => setCandidateA(option?.value || "")}
                  placeholder="-- Select Candidate A --"
                  isClearable
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Select Candidate B
                </label>
                <Select
                  options={candidatesQuery.data?.applicants.map(
                    (candidate) => ({
                      value: candidate.id,
                      label: candidate.name,
                    })
                  )}
                  value={
                    candidateB_ID
                      ? {
                          value: candidateB_ID,
                          label: candidatesQuery.data?.applicants.find(
                            (c) => c.id === candidateB_ID
                          )?.name,
                        }
                      : null
                  }
                  onChange={(option) => setCandidateB(option?.value || "")}
                  placeholder="-- Select Candidate B --"
                  isClearable
                />
              </div>
            </>
          )}
        </div>
      ) : null}

      {candidateA_ID && candidateB_ID ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-[#E30022] mb-2">
                {candidateDataA.data?.user.firstName}{" "}
                {candidateDataA.data?.user.lastName}
              </h3>
              <p className="text-gray-600 mb-1">
                {
                  fetchJobsQuery.data?.jobs?.find(
                    (job) => job.id === selectedJobId
                  )?.title
                }
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {
                  candidatesQuery.data?.applicants.find(
                    (c) => c.id === candidateA_ID
                  )?.email
                }
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Experience:</strong>{" "}
                  {candidateDataA.data?.parsedResume?.raw_output?.work_experience
                    .map((exp: WorkExperience) => exp.title)
                    .join(", ") || "N/A"}
                </p>
                <p>
                  <strong>Education:</strong>{" "}
                  {candidateDataA.data?.parsedResume?.raw_output
                    ?.educational_background[0].degree || "N/A"}
                </p>
                <p>
                  <strong>Skills:</strong>{" "}
                  {candidateDataA.data?.parsedResume?.raw_output.soft_skills.map(
                    (skill: string) => (
                      <span
                        key={skill}
                        className="inline-block bg-[#E30022]/10 text-[#E30022] px-2 py-1 rounded text-xs mr-1 mb-1"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </p>
                <p>
                  <strong>Match Score:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      candidateDataA.data?.score?.score_data
                        ?.predictive_success >= 85
                        ? "text-green-600"
                        : candidateDataA.data?.score?.score_data
                            ?.predictive_success >= 70
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {candidateDataA.data?.score?.score_data?.predictive_success}
                    %
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center text-gray-500 font-semibold">
              VS
            </div>

            <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-[#E30022] mb-2">
                {candidateDataB.data?.user.firstName}{" "}
                {candidateDataB.data?.user.lastName}
              </h3>
              <p className="text-gray-600 mb-1">
                {
                  fetchJobsQuery.data?.jobs?.find(
                    (job) => job.id === selectedJobId
                  )?.title
                }
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {
                  candidatesQuery.data?.applicants.find(
                    (c) => c.id === candidateB_ID
                  )?.email
                }
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Experience:</strong>{" "}
                  {candidateDataB.data?.parsedResume?.raw_output?.work_experience
                    .map((exp: WorkExperience) => exp.title)
                    .join(", ") || "N/A"}
                </p>
                <p>
                  <strong>Education:</strong>{" "}
                  {candidateDataB.data?.parsedResume?.raw_output
                    ?.educational_background[0].degree || "N/A"}
                </p>
                <p>
                  <strong>Skills:</strong>{" "}
                  {candidateDataB.data?.parsedResume?.raw_output.soft_skills.map(
                    (skill: string) => (
                      <span
                        key={skill}
                        className="inline-block bg-[#E30022]/10 text-[#E30022] px-2 py-1 rounded text-xs mr-1 mb-1"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </p>
                <p>
                  <strong>Match Score:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      candidateDataB.data?.score?.score_data
                        ?.predictive_success >= 85
                        ? "text-green-600"
                        : candidateDataB.data?.score?.score_data
                            ?.predictive_success >= 70
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {candidateDataB.data?.score?.score_data?.predictive_success}
                    %
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* --- Feedback Section --- */}
          <div className="mt-6 space-y-6">
            {/* AI Feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                AI Feedback
              </label>
              {AIQuery.isLoading || AIQuery.isFetching ? (
                // Loading skeleton animation
                <div className="animate-pulse space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-20 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-10 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-12 bg-gray-200 rounded" />
                </div>
              ) : AIQuery.data ? (
                <>
                  <h1 className="text-xl mb-2">
                    Better Candidate:{" "}
                    <b className="text-red-600">
                      {AIQuery.data.better_candidate}
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

            {/* Admin Feedback */}
            <div className="mt-6">
              <button
                onClick={() => setShowAdminFeedbackFields((prev) => !prev)}
                className="px-6 py-2 bg-[#E30022] text-white font-semibold rounded-md hover:bg-red-700"
              >
                {showAdminFeedbackFields
                  ? "Hide Admin Feedback"
                  : "Add Admin Feedback"}
              </button>

              {showAdminFeedbackFields && (
                <div className="mt-4 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <textarea
                      value={adminFeedbackA}
                      onChange={(e) => setAdminFeedbackA(e.target.value)}
                      placeholder="Enter feedback for Candidate A"
                      className="w-full p-3 border rounded-md"
                      rows={4}
                    />
                    <textarea
                      value={adminFeedbackB}
                      onChange={(e) => setAdminFeedbackB(e.target.value)}
                      placeholder="Enter feedback for Candidate B"
                      className="w-full p-3 border rounded-md"
                      rows={4}
                    />
                  </div>

                  <div>
                    <button
                      onClick={handleSubmitFeedback}
                      className="px-6 py-2 bg-[#E30022] text-white font-semibold rounded-md hover:bg-red-700"
                    >
                      Submit Feedback
                    </button>
                  </div>
                </div>
              )}

              {/* Display Submitted Feedback as Posts */}
              <div className="mt-6 space-y-4">
                {feedbackPosts.map((post, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-md bg-gray-50 shadow-sm"
                  >
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>James Kenneth Acabal</span>
                      <span>{post.timestamp}</span>
                    </div>
                    <div>
                      <strong>Candidate {post.candidate}:</strong>{" "}
                      {post.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : selectedJobId ? (
        <p className="text-gray-500 text-center mt-10">
          Please select two candidates to compare.
        </p>
      ) : (
        <p className="text-gray-500 text-center mt-10">
          Select a job to view and compare its candidates.
        </p>
      )}
    </div>
  );
}
