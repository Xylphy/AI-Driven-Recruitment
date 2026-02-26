"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { MdAccessTime, MdLocationOn } from "react-icons/md";
import useAuth from "@/hooks/useAuth";
import { formatDate } from "@/lib/library";
import { swalError, swalSuccess } from "@/lib/swal";
import { trpc } from "@/lib/trpc/client";
import type { JobListing } from "@/types/types";

interface Candidate {
  id: string;
  name: string;
  email?: string;
  predictiveSuccess?: number;
}

export default function Page() {
  const router = useRouter();
  const jobId = useParams().id as string;
  const { isAuthenticated } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>();
  const [jobDetails, setJobDetails] = useState<
    Omit<JobListing, "qualifications" | "requirements"> & {
      createdAt: string;
    }
  >({
    title: "",
    location: "Cebu City",
    isFullTime: true,
    createdAt: "",
  });
  const joblistingDetails = trpc.joblisting.getJobDetails.useQuery(
    { jobId },
    {
      enabled: isAuthenticated,
    },
  );
  const candidatesData = trpc.candidate.getCandidatesFromJob.useQuery(
    { jobId },
    {
      enabled: isAuthenticated,
    },
  );
  const deleteJobMutation = trpc.joblisting.deleteJoblisting.useMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Propagate job details
  useEffect(() => {
    if (joblistingDetails.data) {
      startTransition(() =>
        setJobDetails({
          title: joblistingDetails.data.title,
          location: joblistingDetails.data.location,
          isFullTime: joblistingDetails.data.is_fulltime,
          createdAt: joblistingDetails.data.created_at,
        }),
      );
    }
  }, [joblistingDetails.data]);

  useEffect(() => {
    if (candidatesData.data) {
      startTransition(() => setCandidates(candidatesData.data.applicants));
    }
  }, [candidatesData.data]);

  const handleDeleteJob = async () => {
    if (!confirm("This will permanently delete the job listing. Continue?")) {
      return;
    }

    await deleteJobMutation.mutateAsync(
      { joblistingId: jobId },
      {
        onSuccess() {
          swalSuccess("Deleted Successfully", "Job deleted successfully.");

          router.push("/admin/jobs");
        },
        onError(error) {
          swalError("Delete Failed", `Error deleting job: ${error.message}`);
        },
      },
    );
  };

  if (!candidatesData.data || !joblistingDetails.data) {
    return (
      <main className="bg-white min-h-screen py-20 px-4 md:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-44 rounded-md bg-gray-200 mb-6" />
            <div className="h-6 rounded bg-gray-200 w-3/4 mb-2" />
            <div className="h-4 rounded bg-gray-200 w-1/2 mb-6" />
            <div className="space-y-4">
              <div className="h-20 rounded bg-gray-100" />
              <div className="h-20 rounded bg-gray-100" />
              <div className="h-20 rounded bg-gray-100" />
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 py-10 px-4 md:px-20">
      <div className="max-w-6xl mx-auto">
        <div className="relative h-52 rounded-3xl overflow-hidden shadow-xl">
          <Image
            src="/workspace.jpg"
            alt="Header Background"
            fill
            className="object-cover scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-red-900/40 backdrop-blur-sm" />

          <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center text-white">
            <h1 className="text-4xl font-bold tracking-tight">
              {jobDetails.title}
            </h1>

            <div className="mt-4 flex gap-6 text-sm font-medium">
              <span className="flex items-center gap-2 bg-white/10 px-4 py-1 rounded-full backdrop-blur-md">
                <MdLocationOn className="text-red-400" />
                {jobDetails.location}
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-4 py-1 rounded-full backdrop-blur-md">
                <MdAccessTime className="text-red-400" />
                {jobDetails.isFullTime ? "Full-Time" : "Part-Time"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mt-10">
          <div className="flex-1 bg-white/40 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-xl p-8">
            <section>
              <h2 className="text-2xl font-bold text-red-600 mb-6">
                Applicants for this job
              </h2>

              {candidates?.length === 0 ? (
                <div className="text-gray-500 text-sm bg-white/50 p-6 rounded-2xl">
                  No candidates yet.
                </div>
              ) : (
                <ul className="space-y-5">
                  {candidates?.map((candidate) => (
                    <li
                      key={candidate.id}
                      className="flex items-center justify-between bg-white/50 backdrop-blur-lg border border-white/60 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {candidate.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {candidate.email || "No email"}
                        </p>
                        <p className="text-xs text-red-600 font-semibold mt-1">
                          {candidate.predictiveSuccess || 0}% Job Match
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/candidateprofile/${candidate.id}`)
                        }
                        className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300"
                      >
                        View Profile
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="w-full lg:w-80 bg-white/40 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-xl p-8 space-y-8">
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Job Summary
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>
                  <span className="font-semibold">Published:</span>{" "}
                  {formatDate(jobDetails.createdAt)}
                </li>
                <li>
                  <span className="font-semibold">Job Nature:</span>{" "}
                  {jobDetails.isFullTime ? "Full-Time" : "Part-Time"}
                </li>
                <li>
                  <span className="font-semibold">Location:</span>{" "}
                  {jobDetails.location}
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Company Detail
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Alliance Software, Inc. is a global IT services and solutions
                company. Established in 2000, Alliance has grown to become one
                of the Philippines’ largest independent software development
                companies.
              </p>
            </section>

            <div className="space-y-3 pt-4 border-t border-white/40">
              <button
                type="button"
                onClick={() => router.push(`/joblisting/${jobId}`)}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold py-2 rounded-xl shadow-md hover:scale-105 transition-all"
              >
                See Job Details
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full bg-white/60 backdrop-blur-md border border-red-500 text-red-600 font-semibold py-2 rounded-xl hover:bg-red-50 transition-all"
              >
                Delete Job
              </button>

              <button
                type="button"
                onClick={() => router.push(`/joblisting/${jobId}/edit`)}
                className="w-full bg-white/60 backdrop-blur-md border border-gray-400 text-gray-700 font-semibold py-2 rounded-xl hover:bg-gray-100 transition-all"
              >
                Edit Job
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full bg-gray-200/70 text-gray-700 font-semibold py-2 rounded-xl hover:bg-gray-300 transition-all"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to delete this job? This action cannot be
              undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition-all"
                onClick={() => setShowDeleteModal(false)}
                type="button"
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl shadow-md hover:scale-105 transition-all"
                onClick={handleDeleteJob}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
