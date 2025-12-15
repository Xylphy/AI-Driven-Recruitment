"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

export default function ApplicantsPage() {
  const router = useRouter();
  const applicantsQuery = trpc.candidate.getCandidateFromJob.useQuery({});
  const [searchInput, setSearchInput] = useState("");

  // Filter applicants based on the single search input
  const filteredApplicants = useMemo(() => {
    if (!applicantsQuery.data?.applicants) return [];

    return applicantsQuery.data.applicants.filter((candidate) => {
      const input = searchInput.toLowerCase();
      const nameMatch = candidate.name.toLowerCase().includes(input);
      const jobMatch = candidate.jobTitle.toLowerCase().includes(input);
      const statusMatch = (candidate.status || "Pending")
        .toLowerCase()
        .includes(input);

      return nameMatch || jobMatch || statusMatch;
    });
  }, [searchInput, applicantsQuery.data]);

  if (applicantsQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="flex items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-red-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span className="text-gray-700 font-medium">
            Loading candidates...
          </span>
        </div>
      </div>
    );
  }

  if (applicantsQuery.error) {
    return (
      <div className="p-6">
        <div className="flex items-start gap-4 bg-red-50 border border-red-100 p-4 rounded">
          <svg
            className="h-6 w-6 text-red-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 14l2-2m0 0l2-2m-2 2l2 2m-2-2l-2 2M12 6v6"
            />
          </svg>
          <div>
            <p className="text-red-700 font-semibold">
              Failed to load candidates
            </p>
            <p className="mt-1 text-sm text-red-600">
              {applicantsQuery.error.message}
            </p>
            <div className="mt-3">
              <button
                onClick={() => router.refresh()}
                className="px-3 py-1 text-sm bg-[#E30022] text-white rounded hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Candidate Management
      </h2>

      {/* Single Search Input */}
      <input
        type="text"
        placeholder="Search by Name, Job, or Status..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-full md:w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none mb-4"
      />

      {/* Table */}
      <div className="overflow-x-auto max-h-[600px]">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-600 text-sm uppercase sticky top-0">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Job Applied</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Job Match Score</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredApplicants.length > 0 ? (
              filteredApplicants.map((candidate, index) => (
                <tr
                  key={index}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 font-medium">{candidate.name}</td>
                  <td className="py-3 px-4">{candidate.email}</td>
                  <td className="py-3 px-4">{candidate.jobTitle}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        candidate.status === "Hired"
                          ? "bg-green-100 text-green-700"
                          : candidate.status === "Rejected"
                          ? "bg-yellow-100 text-yellow-700"
                          : candidate.status === "For Interview"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {candidate.status || "Pending"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold">
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
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        className="px-3 py-1 text-sm bg-[#E30022] text-white rounded hover:bg-red-700 transition"
                        onClick={() =>
                          router.push(`/candidateprofile/${candidate.id}`)
                        }
                      >
                        View
                      </button>
                      <button className="px-3 py-1 text-sm border border-[#E30022] text-[#E30022] rounded hover:bg-red-50 transition">
                        Compare
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center p-6 text-gray-500 italic"
                >
                  No candidates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
