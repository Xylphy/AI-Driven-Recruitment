"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

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
    },
  );

  const hrOfficerJobsQuery = trpc.hrOfficer.assignedJobs.useQuery(
    { query: searchInput },
    {
      enabled: userInfo.isSuccess && role === "HR Officer",
    },
  );

  const jobs =
    role === "Admin" || role === "SuperAdmin"
      ? jobsQuery.data?.jobs
      : hrOfficerJobsQuery.data?.jobs;

  return (
    <div className="min-h-screen p-8 space-y-6 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-100 via-white to-red-50 opacity-40 pointer-events-none" />

      <div className="relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-600 bg-clip-text text-transparent">
            Job Listings
          </h2>

          <input
            type="text"
            placeholder="Search by Job Title"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full md:w-80 px-5 py-2 rounded-2xl bg-white/40 border border-white/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-red-400 shadow-inner transition-all"
          />
          {(role === "Admin" || role === "SuperAdmin") && (
            <button
              className="px-5 py-3 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition flex items-center gap-2"
              onClick={() => router.push("/createjob")}
              type="button"
            >
              Add Job Listing
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <title>Icon for adding a new job listing</title>
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-red-50 text-red-600">
            <tr>
              <th className="p-4 text-left font-semibold">Job Title</th>
              <th className="p-4 text-left font-semibold">Applicants</th>
              <th className="p-4 text-left font-semibold">Status</th>
              <th className="p-4 text-left font-semibold">HR Officer</th>
            </tr>
          </thead>
          <tbody>
            {jobsQuery.isLoading ? (
              [...Array(3)].map((_) => (
                <tr key={crypto.randomUUID()}>
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
                  className="hover:bg-gray-50 transition cursor-pointer"
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
