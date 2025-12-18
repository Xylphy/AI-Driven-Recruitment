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

  const handleEdit = (jobId: string) => {
    router.push(`/joblisting/${jobId}/edit`);
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    console.log("Delete job:", jobId);
  };

  if (jobsQuery.isLoading) {
    return <div className="p-6 text-gray-500">Loading job listings…</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-red-600">Job Listings</h2>

      <div className="flex items-center gap-[20px] mb-4">
        <input
          type="text"
          placeholder="Search by Job Title"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
        />

        <button
          onClick={() => router.push("/createjob")}
          className="bg-red-600 text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 hover:bg-transparent hover:text-red-600 hover:border-red-600 flex items-center gap-2 whitespace-nowrap"
        >
          Add Job Listing
        </button>
      </div>

      <div className="overflow-x-auto max-h-150">
        <table className="w-full bg-white shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-gray-100 sticky top-0 text-left">
            <tr>
              <th className="p-4 font-semibold">Job Title</th>
              <th className="p-4 font-semibold">Applicants</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">HR Officer</th>
              <th className="p-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-t hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.push(`/joblisting/${job.id}`)}
                >
                  <td className="p-4">{job.title}</td>

                  <td className="p-4">{job.applicant_count}</td>

                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Open
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        job.hr_officer
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {job.hr_officer?.name ?? "Unassigned"}
                    </span>
                  </td>

                  <td
                    className="p-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => router.push(`/joblisting/${job.id}`)}
                        className="px-2 py-1 border border-red-600 text-red-600 rounded hover:bg-red-600 hover:text-white transition"
                      >
                        View
                      </button>

                      <button
                        onClick={() => handleEdit(job.id)}
                        className="px-2 py-1 border border-red-600 text-red-600 rounded hover:bg-red-600 hover:text-white transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(job.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
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
