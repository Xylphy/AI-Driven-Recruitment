"use client";

import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";

export default function JobsPage() {
  const router = useRouter();
  const jobsQuery = trpc.joblisting.fetchJobs.useQuery();

  if (jobsQuery.isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <svg
            className="h-6 w-6 text-gray-400 animate-spin"
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
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

        <span className="sr-only">Loading job listings</span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-red-600">Job Listings</h2>
      <table className="w-full bg-white shadow-sm rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-4 font-semibold">Job Title</th>
            <th className="p-4 font-semibold">Applicants</th>
            <th className="p-4 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {jobsQuery.data?.jobs.map((job) => (
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
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    // job.status === "Open"
                    //   ? "bg-green-100 text-green-700"
                    //   : "bg-red-100 text-red-700"
                    "bg-green-100 text-green-700"
                  }`}
                >
                  Open
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
