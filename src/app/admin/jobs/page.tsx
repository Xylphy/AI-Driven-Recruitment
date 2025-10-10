"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { JobListing } from "@/types/schema";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<
    (JobListing & { applicant_count: number })[]
  >([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/jobs", {
      method: "GET",
      signal: controller.signal,
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
      })
      .then((data) => {
        setJobs(data.data);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          alert("Failed to fetch jobs. Please try again later.");
        }
      });

    return () => controller.abort();
  }, []);

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
          {jobs.map((job) => (
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
