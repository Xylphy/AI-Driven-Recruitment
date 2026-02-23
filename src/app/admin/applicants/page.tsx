"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc/client";

export default function ApplicantsPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const { isAuthenticated } = useAuth();

  const applicantsQuery = trpc.candidate.getCandidatesFromJob.useQuery(
    {
      searchQuery: searchInput,
    },
    {
      enabled: isAuthenticated,
    },
  );

  const filteredApplicants = applicantsQuery.data?.applicants || [];

  if (applicantsQuery.error) {
    return (
      <div className="p-8">
        <div className="rounded-3xl backdrop-blur-2xl bg-white/30 border border-white/20 shadow-2xl p-8">
          <h3 className="text-xl font-semibold text-red-600">
            Failed to load candidates
          </h3>
          <p className="mt-2 text-sm text-red-500">
            {applicantsQuery.error.message}
          </p>

          <button
            onClick={() => router.refresh()}
            className="mt-6 px-5 py-2 rounded-xl bg-linear-to-r from-red-600 to-red-500 text-white shadow-md hover:scale-105 transition-all duration-300"
            type="button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-red-100 via-white to-red-50 opacity-40 pointer-events-none" />

      <div className="relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-3xl font-bold bg-linear-to-r from-red-600 to-red-600 bg-clip-text text-transparent">
            Candidate Management
          </h2>

          <input
            type="text"
            placeholder="Search by Name, Job, or Status..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full md:w-80 px-5 py-2 rounded-2xl bg-white/40 border border-white/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-red-400 shadow-inner transition-all"
          />
        </div>

        <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-red-50 text-red-600">
              <tr>
                <th className="py-4 px-6 text-left">Name</th>
                <th className="py-4 px-6 text-left">Job Applied</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-center">Match Score</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="text-gray-800">
              {applicantsQuery.isLoading ? (
                [0, 1, 2].map((i) => (
                  <tr key={i}>
                    <td className="p-6">
                      <div className="h-4 bg-white/50 rounded w-2/3 animate-pulse" />
                    </td>
                    <td className="p-6">
                      <div className="h-4 bg-white/50 rounded w-1/2 animate-pulse" />
                    </td>
                    <td className="p-6">
                      <div className="h-4 bg-white/50 rounded w-1/3 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredApplicants.length > 0 ? (
                filteredApplicants.map((candidate) => (
                  <tr
                    key={crypto.randomUUID()}
                    className="border-white/20 hover:bg-white/30 transition-all duration-300"
                  >
                    <td className="py-4 px-6 font-medium">{candidate.name}</td>

                    <td className="py-4 px-6">{candidate.jobTitle}</td>

                    <td className="py-4 px-6 text-center">
                      <span
                        className={`px-4 py-1 text-xs font-semibold rounded-full backdrop-blur-md ${
                          candidate.status === "Paper Screening"
                            ? "bg-green-200/40 text-green-700"
                            : candidate.status === "Close Status"
                              ? "bg-yellow-200/40 text-yellow-700"
                              : candidate.status === "Exam"
                                ? "bg-blue-200/40 text-blue-700"
                                : "bg-gray-200/40 text-gray-700"
                        }`}
                      >
                        {candidate.status || "Pending"}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center font-semibold">
                      <span
                        className={`${
                          candidate.predictiveSuccess >= 85
                            ? "text-green-600"
                            : candidate.predictiveSuccess >= 70
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {candidate.predictiveSuccess}%
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          className="px-4 py-1 text-xs font-semibold rounded-xl bg-linear-to-r from-red-600 to-red-500 text-white shadow-md hover:scale-105 transition-all"
                          onClick={() =>
                            router.push(`/candidateprofile/${candidate.id}`)
                          }
                          type="button"
                        >
                          View
                        </button>

                        <button
                          className="px-4 py-1 text-xs font-semibold rounded-xl bg-white/40 border border-red-400 text-red-600 backdrop-blur-md hover:bg-red-50 transition"
                          type="button"
                        >
                          Compare
                        </button>

                        <a
                          href={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload/${candidate.resumeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-1 text-xs font-semibold rounded-xl bg-white/40 border border-red-400 text-red-600 backdrop-blur-md hover:bg-red-50 transition"
                        >
                          Resume
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-10 text-gray-500 italic"
                  >
                    No candidates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
