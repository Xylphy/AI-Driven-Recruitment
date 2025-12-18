"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";

export default function JobsPage() {
  const router = useRouter();
  const jobsQuery = trpc.joblisting.fetchJobs.useQuery({});
  const [searchInput, setSearchInput] = useState("");

  const filteredJobs = useMemo(() => {
    if (!jobsQuery.data?.jobs) return [];
    const input = searchInput.toLowerCase();

    return jobsQuery.data.jobs.filter((job) => {
      const titleMatch = job.title.toLowerCase().includes(input);
      const applicantMatch = job.applicant_count.toString().includes(input);
      const statusMatch = "open".includes(input);

      return titleMatch || applicantMatch || statusMatch;
    });
  }, [searchInput, jobsQuery.data]);

  if (jobsQuery.isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <svg
            className="h-6 w-6 text-gray-400 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
          <h2 className="text-lg font-medium text-gray-700">
            Loading job listings…
          </h2>
        </div>

        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
              <div className="h-6 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-red-600">Job Listings</h2>

      <input
        type="text"
        placeholder="Search by Job Title"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-full md:w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none mb-4"
      />

      <div className="overflow-x-auto max-h-150">
        <table className="w-full bg-white shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-left sticky top-0">
            <tr>
              <th className="p-4 font-semibold">Job Title</th>
              <th className="p-4 font-semibold">Applicants</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-t hover:bg-gray-50 transition cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/joblisting/${job.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      router.push(`/joblisting/${job.id}`);
                    }
                  }}
                >
                  <td className="p-4">{job.title}</td>
                  <td className="p-4">{job.applicant_count}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Open
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="text-center p-6 text-gray-500 italic"
                >
                  No jobs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
