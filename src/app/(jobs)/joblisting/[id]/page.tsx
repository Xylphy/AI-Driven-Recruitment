"use client";

import { MdLocationOn, MdAccessTime, MdChevronRight } from "react-icons/md";
import Image from "next/image";
import { MdNotifications, MdNotificationsActive } from "react-icons/md";
import useAuth from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import { formatDate } from "@/lib/library";

type UIState = {
  showDeleteModal: boolean;
  isDeleting: boolean;
  isApplying: boolean;
  isNotifying: boolean;
};

export default function Page() {
  const router = useRouter();
  const jobId = useParams().id as string;

  const { isAuthenticated } = useAuth({
    routerActivation: false,
  });
  const jwtDecoded = trpc.auth.decodeJWT.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const [states, setStates] = useState<UIState>({
    showDeleteModal: false,
    isDeleting: false,
    isApplying: false,
    isNotifying: false,
  });

  const [error, setError] = useState<string | null>(null);
  const deleteJobMutation = trpc.joblisting.deleteJoblisting.useMutation();
  const jobDetails = trpc.joblisting.getJobDetails.useQuery({
    jobId,
  });
  const applyJobMutation = trpc.joblisting.applyForJob.useMutation();
  const notifyMutation = trpc.joblisting.notify.useMutation();

  const handleNotify = async () => {
    setStates((prev) => ({ ...prev, isNotifying: true }));
    setError(null);

    await notifyMutation.mutateAsync(
      { jobId },
      {
        onSuccess() {
          alert("Notification preference updated");
          jobDetails.refetch();
        },
        onError(error) {
          setError(error.message);
        },
        onSettled() {
          setStates((prev) => ({ ...prev, isNotifying: false }));
        },
      }
    );
  };

  const handleApply = async () => {
    setStates((prev) => ({ ...prev, isApplying: true }));
    setError(null);

    await applyJobMutation.mutateAsync(
      { jobId },
      {
        onSuccess() {
          alert("Applied successfully");
          jobDetails.refetch();
        },
        onError(error) {
          setError(error.message);
        },
        onSettled() {
          setStates((prev) => ({ ...prev, isApplying: false }));
        },
      }
    );
  };

  const handleDeleteJob = async () => {
    if (!confirm("This will permanently delete the job listing. Continue?")) {
      return;
    }
    setStates((prev) => ({ ...prev, isDeleting: true }));
    setError(null);

    await deleteJobMutation.mutateAsync(
      { joblistingId: jobId },
      {
        onSuccess() {
          alert("Job deleted successfully");
          router.push("/profile");
        },
        onError(error) {
          setError(error.message);
        },
        onSettled() {
          setStates((prev) => ({
            ...prev,
            isDeleting: false,
            showDeleteModal: false,
          }));
        },
      }
    );
  };

  if (jobDetails.isLoading) {
    return (
      <main className="bg-white min-h-screen py-5 px-4 md:px-20">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-44 bg-gray-200 rounded mb-6" />
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-2/3 p-8">
              <div className="h-6 bg-gray-200 rounded mb-4 w-1/3" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
            <div className="w-full lg:w-1/3 bg-gray-50 border-l p-6">
              <div className="h-6 bg-gray-200 rounded mb-4 w-1/2" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-10 bg-gray-200 rounded w-full mt-6" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen py-5 px-4 md:px-20">
      {states.showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this job listing? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() =>
                  setStates((prev) => ({ ...prev, showDeleteModal: false }))
                }
                disabled={states.isDeleting}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteJob}
                disabled={states.isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {states.isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="relative h-44">
          <Image
            src="/workspace.jpg"
            alt="Header Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/75 z-10" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
            <h1 className="text-3xl font-bold text-center text-white">
              {jobDetails.data?.title}
            </h1>
            <hr className="w-1/2 mx-auto border-t border-red-600 my-2" />
            <div className="flex justify-center mt-2 space-x-4 text-white font-medium text-sm">
              <span className="flex items-center gap-1">
                <MdLocationOn className="text-red-600" />{" "}
                {jobDetails.data?.location}
              </span>
              <span className="flex items-center gap-1">
                <MdAccessTime className="text-red-600" />{" "}
                {jobDetails.data?.is_fulltime ? "Full-Time" : "Part-Time"}
              </span>
            </div>

            {isAuthenticated && (
              <div className="mt-3">
                <button
                  onClick={handleNotify}
                  disabled={states.isNotifying}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    jobDetails.data?.notify
                      ? "bg-white/90 text-red-600 border-white/90"
                      : "bg-transparent text-white border-white/50 hover:bg-white/10"
                  } disabled:opacity-60`}
                >
                  {jobDetails.data?.notify ? (
                    <MdNotificationsActive />
                  ) : (
                    <MdNotifications />
                  )}
                  <span>
                    {states.isNotifying
                      ? "..."
                      : jobDetails.data?.notify
                      ? "Notified"
                      : "Notify me"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col lg:flex-row py-5">
          <div className="w-full lg:w-2/3 p-8">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Qualifications
              </h2>
              <ul className="space-y-2 text-gray-700 text-sm">
                {jobDetails.data?.qualifications.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <MdChevronRight className="text-red-600 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Requirements
              </h2>
              <ul className="space-y-2 text-gray-700 text-sm">
                {jobDetails.data?.requirements.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <MdChevronRight className="text-red-600 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Tags</h2>
              <ul className="space-y-2 text-gray-700 text-sm">
                {jobDetails.data?.tags.map((tag, index) => (
                  <li
                    key={index}
                    className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm mr-2 mb-2"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="w-full lg:w-1/3 bg-gray-50 border-l p-6">
            {error && (
              <div className="mb-4 rounded bg-red-50 border border-red-200 text-red-700 px-4 py-2">
                {error}
              </div>
            )}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Job Summary
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  <strong>Published:</strong>{" "}
                  {formatDate(jobDetails.data?.created_at)}
                </li>
                <li>
                  <strong>Job Nature:</strong>{" "}
                  {jobDetails.data?.is_fulltime ? "Full-Time" : "Part-Time"}
                </li>
                <li>
                  <strong>Location:</strong> {jobDetails.data?.location}
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Company Detail
              </h3>
              <p className="text-sm text-gray-700">
                Alliance Software, Inc. is a global IT services and solutions
                company. Established in 2000, Alliance has grown to become one
                of the Philippines’ largest and most respected independent
                software development companies.
              </p>
            </section>

            {jwtDecoded.data?.user.isAdmin && (
              <>
                <button
                  onClick={() => router.push(`/candidates/${jobId}`)}
                  className="mt-6 w-full bg-red-600 text-white font-bold py-2 rounded border border-transparent hover:bg-transparent hover:text-red-600 hover:border-red-600"
                >
                  See Applicants
                </button>
                <button
                  onClick={() =>
                    setStates((prev) => ({ ...prev, showDeleteModal: true }))
                  }
                  className="mt-2 w-full bg-red-600 text-white font-bold py-2 rounded border border-transparent hover:bg-transparent hover:text-red-600 hover:border-red-600"
                >
                  Delete Job
                </button>
                <button
                  className="mt-2 w-full bg-red-600 text-white font-bold py-2 rounded border border-transparent hover:bg-transparent hover:text-red-600 hover:border-red-600"
                  onClick={() => router.push(`/joblisting/${jobId}/edit`)}
                >
                  Edit Job
                </button>
              </>
            )}

            {!jwtDecoded.data?.user.isAdmin && isAuthenticated && (
              <>
                <button
                  className={`mt-2 w-full font-bold py-2 rounded border border-transparent transition-all duration-300 ease-in-out ${
                    jobDetails.data?.isApplicant
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-transparent hover:text-red-600 hover:border-red-600"
                  }`}
                  onClick={handleApply}
                  disabled={jobDetails.data?.isApplicant || states.isApplying}
                >
                  {jobDetails.data?.isApplicant
                    ? "Applied"
                    : states.isApplying
                    ? "Applying..."
                    : "Apply Job"}
                </button>
              </>
            )}

            <button
              onClick={() => router.back()}
              className="mt-2 w-full bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-gray-500 hover:border-gray-500"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
