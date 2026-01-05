"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";

type Job = {
  id: string;
  title: string;
  created_at: string;
  is_fulltime: boolean;
  location: string;
  applicant_count: number;
  officer_name?: string;
};

export default function JobsPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const userInfo = trpc.auth.decodeJWT.useQuery();
  const role = userInfo.data?.user.role;

  const jobsQuery = trpc.admin.fetchJobs.useQuery(
    { searchQuery: searchInput },
    {
      enabled:
        (userInfo.isSuccess && role === "Admin") || role === "SuperAdmin",
    }
  );

  const hrOfficerJobsQuery = trpc.hrOfficer.assignedJobs.useQuery(
    { query: searchInput },
    {
      enabled: userInfo.isSuccess && role === "HR Officer",
    }
  );

  const jobs =
    role === "Admin" || role === "SuperAdmin"
      ? jobsQuery.data?.jobs
      : hrOfficerJobsQuery.data?.jobs;

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-3xl font-extrabold text-red-600">Job Listings</h2>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <input
          type="text"
          placeholder="Search by Job Title"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full md:w-1/2 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
        />

        {(role === "Admin" || role === "SuperAdmin") && (
          <button
            onClick={() => router.push("/createjob")}
            className="px-5 py-3 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition flex items-center gap-2"
          >
            Add Job Listing
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="overflow-x-auto max-h-125 rounded-lg shadow border border-gray-200">
        <table className="w-full border-collapse text-gray-700">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-left font-semibold">Job Title</th>
              <th className="p-4 text-left font-semibold">Applicants</th>
              <th className="p-4 text-left font-semibold">Status</th>
              <th className="p-4 text-left font-semibold">HR Officer</th>
            </tr>
          </thead>
          <tbody>
            {jobsQuery.isLoading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="border-t">
                  <td className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                  </td>
                  {role !== "HR Officer" && (
                    <td className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                    </td>
                  )}
                </tr>
              ))
            ) : Array.isArray(jobs) && jobs.length > 0 ? (
              jobs.map((job: Job) => (
                <tr
                  key={job.id}
                  className="border-t hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.push(`/joblisting/${job.id}`)}
                >
                  <td className="p-4 font-medium">{job.title}</td>
                  <td className="p-4">{job.applicant_count}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-700">
                      Open
                    </span>
                  </td>
                  {role !== "HR Officer" && (
                    <td className="p-4">{job.officer_name || "-"}</td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
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
