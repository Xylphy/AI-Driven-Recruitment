"use client";

import type { inferProcedureOutput } from "@trpc/server";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/library";
import type jobListingRouter from "@/lib/trpc/routers/joblisting";

const colorMap: Record<string, string> = {
  "Initial Interview": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "For Interview": "bg-blue-100 text-blue-700 border-blue-300",
  Hired: "bg-green-100 text-green-700 border-green-300",
  Rejected: "bg-red-100 text-red-700 border-red-300",
};

const StatusBadge = ({ status }: { status: string }) => {
  return (
    <span
      className={`text-xs px-2 py-1 rounded-md border ${
        colorMap[status] ?? "bg-gray-100 text-gray-600 border-gray-300"
      }`}
    >
      {status}
    </span>
  );
};

export default function JobApplicationDetails({
  jobApplications,
}: {
  jobApplications: inferProcedureOutput<
    (typeof jobListingRouter)["joblistings"]
  >;
}) {
  const router = useRouter();

  return (
    <div className="grid gap-4">
      {jobApplications.joblistings.map((job) => {
        const href = `/joblisting/${job.joblisting_id}` as Route;

        return (
          <div
            key={job.id}
            className="p-4 bg-white shadow-md rounded-lg flex justify-between items-center gap-4"
          >
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold">
                <Link
                  href={href}
                  className="hover:underline focus:outline-none focus:ring-2 focus:ring-red-600 rounded"
                >
                  {job.title}
                </Link>
                {" · "}
                <StatusBadge status={job.status ?? "To be reviewed"} />
              </h3>

              <p className="text-sm text-gray-500">
                Applied at:{" "}
                <span className="font-medium">
                  {formatDate(job.created_at)}
                </span>
              </p>
            </div>

            <button
              className="border-2 border-red-600 text-red-600 px-4 py-1 text-sm font-semibold rounded hover:bg-red-600 hover:text-white transition whitespace-nowrap"
              type="button"
              onClick={() => router.push(href)}
            >
              TRACK APPLICATION
            </button>
          </div>
        );
      })}
    </div>
  );
}
