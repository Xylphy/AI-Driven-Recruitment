"use client";

import useAuth from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface WorkExperience {
  company: string;
  start_date?: Date;
  title: string;
  end_date?: Date;
}

export default function ComparePage() {
  const router = useRouter();
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [candidateA, setCandidateA] = useState<string>("");
  const [candidateB, setCandidateB] = useState<string>("");

  const { isAuthenticated } = useAuth();
  const jwtQuery = trpc.auth.decodeJWT.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const fetchJobsQuery = trpc.admin.fetchAllJobs.useQuery(undefined, {
    enabled: jwtQuery.data?.user.isAdmin,
  });

  if (!jwtQuery.data?.user.isAdmin) {
    alert("You are not authorized to access this page.");
    router.push("/profile");
  }

  const candidatesQuery = trpc.candidate.getCandidateFromJob.useQuery(
    {
      jobId: selectedJobId,
    },
    {
      enabled: !!selectedJobId && jwtQuery.data?.user.isAdmin,
    }
  );

  const candidateDataA = trpc.candidate.fetchCandidateProfile.useQuery(
    {
      candidateId: candidateA,
      fetchResume: true,
      fetchScore: true,
      fetchTranscribed: true,
    },
    {
      enabled: !!candidateA,
    }
  );

  const candidateDataB = trpc.candidate.fetchCandidateProfile.useQuery(
    {
      candidateId: candidateB,
      fetchResume: true,
      fetchScore: true,
      fetchTranscribed: true,
    },
    {
      enabled: !!candidateB,
    }
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
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
          <select
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#E30022]"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            <option value="">-- Select Job --</option>
            {fetchJobsQuery.data?.jobs?.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedJobId && (
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
                <select
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#E30022]"
                  value={candidateA}
                  onChange={(e) => setCandidateA(e.target.value)}
                >
                  <option value="">-- Select Candidate A --</option>
                  {candidatesQuery.data?.applicants.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Select Candidate B
                </label>
                <select
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#E30022]"
                  value={candidateB}
                  onChange={(e) => setCandidateB(e.target.value)}
                >
                  <option value="">-- Select Candidate B --</option>
                  {candidatesQuery.data?.applicants.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      )}

      {candidateA && candidateB ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-[#E30022] mb-2">
              {candidateDataA.data?.user.firstName}{" "}
              {candidateDataA.data?.user.lastName}
            </h3>
            <p className="text-gray-600 mb-1">
              {/* 
                No job title for parsing resume
            */}
              {
                fetchJobsQuery.data?.jobs?.find(
                  (job) => job.id === selectedJobId
                )?.title
              }
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {
                candidatesQuery.data?.applicants.find(
                  (c) => c.id === candidateA
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
                  {candidateDataA.data?.score?.score_data?.predictive_success}%
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
              {/* 
                No job title for parsing resume
            */}
              {
                fetchJobsQuery.data?.jobs?.find(
                  (job) => job.id === selectedJobId
                )?.title
              }
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {
                candidatesQuery.data?.applicants.find(
                  (c) => c.id === candidateB
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
                  {candidateDataB.data?.score?.score_data?.predictive_success}%
                </span>
              </p>
            </div>
          </div>
        </div>
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
