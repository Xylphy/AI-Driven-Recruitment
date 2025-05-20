"use client";

import { JobApplicationDetail } from "@/app/types/types";

export default function JobApplicationDetails({
  jobApplications,
  isAdmin,
}: {
  jobApplications: JobApplicationDetail[];
  isAdmin: boolean;
}) {
  return (
    <div className="grid gap-4">
      {jobApplications.map((job, index) => (
        <div
          key={index}
          className="p-4 bg-white shadow-md rounded-lg flex justify-between items-center gap-4"
        >
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <p className="text-sm text-gray-500">
              Applied on <span className="font-medium">{job.date}</span>
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
