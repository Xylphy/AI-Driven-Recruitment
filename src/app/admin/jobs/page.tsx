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
};

export default function JobsPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const userInfo = trpc.auth.decodeJWT.useQuery();
  const jobsQuery = trpc.joblisting.fetchJobs.useQuery(
    {
      searchQuery: searchInput,
    },
    {
      enabled:
        (userInfo.isSuccess && userInfo.data.user.role === "Admin") ||
        userInfo.data?.user.role === "SuperAdmin",
    }
  );

  const hrOfficerJobsQuery = trpc.hrOfficer.assignedJobs.useQuery(
    {
      query: searchInput,
    },
    {
      enabled: userInfo.isSuccess && userInfo.data.user.role === "HR Officer",
    }
  );

  const jobs =
    userInfo.data?.user.role === "Admin" ||
    userInfo.data?.user.role === "SuperAdmin"
      ? jobsQuery.data?.jobs
      : hrOfficerJobsQuery.data?.jobs;

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

      {userInfo.data?.user.role === "Admin" && (
        <button
          onClick={() => router.push("/createjob")}
          className="bg-red-600 text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-600 hover:border-red-600 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <span>Add Job Listing</span>
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
            {jobsQuery.isLoading ? (
              <>
                {[0, 1, 2].map((i) => (
                  <tr key={i}>
                    <td className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                    </td>
                    <td className="p-4">
                      <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                    </td>
                  </tr>
                ))}
              </>
            ) : Array.isArray(jobs) && jobs.length > 0 ? (
              jobs.map((job: Job) => (
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
