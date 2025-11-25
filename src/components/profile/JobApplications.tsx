"use client";

import { useRouter } from "next/navigation";
import { JobListing } from "@/types/schema";
import { formatDate } from "@/lib/library";

export default function JobApplicationDetails({
  jobApplications,
  isAdmin,
}: {
  jobApplications: JobListing[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  return (
    <div className="grid gap-4">
      {jobApplications.map((job) => (
        <div
          key={job.id}
          className="p-4 bg-white shadow-md rounded-lg flex justify-between items-center gap-4"
          onClick={() => router.push(`/joblisting/${job.joblisting_id}`)}
        >
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <p className="text-sm text-gray-500">
              {isAdmin ? "Created at" : "Applied at"}:{" "}
              <span className="font-medium">{formatDate(job.created_at)}</span>
            </p>
          </div>
          <button className="border-2 border-red-600 text-red-600 px-4 py-1 text-sm font-semibold rounded hover:bg-red-600 hover:text-white transition whitespace-nowrap">
            TRACK {isAdmin ? "JOB" : "APPLICATION"}
          </button>
        </div>
      ))}
    </div>
  );
}
