"use client";

import type { Route } from "next";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdAccessTime, MdChevronRight, MdLocationOn } from "react-icons/md";
import useAuth from "@/hooks/useAuth";
import { formatDate } from "@/lib/library";
import { swalConfirm, swalError, swalSuccess } from "@/lib/swal";
import { trpc } from "@/lib/trpc/client";

type UIState = {
  showDeleteModal: boolean;
  isDeleting: boolean;
  isApplying: boolean;
  isNotifying: boolean;
};

type JobDetail = {
  title: string;
  requirements: string[];
  qualifications: string[];
  tags: string[];
  created_at: string;
  is_fulltime: boolean;
  location: string;
};

export default function Page() {
  const router = useRouter();
  const jobId = useParams().id as string;
  // const [showSkillModal, setShowSkillModal] = useState(false);
  const [tags, setTags] = useState<
    {
      skill: string;
      rating: number;
    }[]
  >([]);

  const { isAuthenticated } = useAuth({
    routerActivation: false,
  });
  const [states, setStates] = useState<UIState>({
    showDeleteModal: false,
    isDeleting: false,
    isApplying: false,
    isNotifying: false,
  });

  const jobDetailsUser = trpc.joblisting.getJobDetails.useQuery({ jobId });
  const jobDetailsStaff = trpc.staff.getJobDetails.useQuery(
    { jobId },
    {
      enabled: isAuthenticated,
    },
  );

  const jobDetails: JobDetail | undefined = isAuthenticated
    ? jobDetailsStaff.data
    : jobDetailsUser.data;

  // const applyJobMutation = trpc.joblisting.applyForJob.useMutation();
  const deleteJobMutation = trpc.joblisting.deleteJoblisting.useMutation();

  useEffect(() => {
    if (!jobDetails?.tags) {
      return;
    }

    setTags((prev) => {
      const prevMap = new Map(prev.map((t) => [t.skill, t.rating]));
      return jobDetails.tags.map((tag) => ({
        skill: tag,
        rating: prevMap.get(tag) ?? 0,
      }));
    });
  }, [jobDetails?.tags]);

  const handleDeleteJob = async () => {
    swalConfirm(
      "Delete Job Listing?",
      "This action cannot be undone.",
      async () => {
        setStates((prev) => ({ ...prev, isDeleting: true }));

        try {
          await deleteJobMutation.mutateAsync({
            joblistingId: jobId,
            officer_id: jobDetailsUser.data?.officer_id || "",
          });

          swalSuccess("Deleted", "Job listing deleted successfully", () => {
            router.push("/admin");
          });
        } catch (error: unknown) {
          swalError(
            "Delete Failed",
            typeof error === "object" && error !== null && "message" in error
              ? String((error as { message?: unknown }).message)
              : "An unexpected error occurred",
          );
        } finally {
          setStates((prev) => ({
            ...prev,
            isDeleting: false,
            showDeleteModal: false,
          }));
        }
      },
    );
  };

  if (!jobDetails) {
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
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 py-10 px-4 md:px-20">
      {states.showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this job listing? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                disabled={states.isDeleting}
                onClick={() =>
                  setStates((prev) => ({ ...prev, showDeleteModal: false }))
                }
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                disabled={states.isDeleting}
                onClick={handleDeleteJob}
                type="button"
              >
                {states.isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="relative h-52 rounded-3xl overflow-hidden shadow-xl">
          <Image
            src="/workspace.jpg"
            alt="Header Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              {jobDetails.title}
            </h1>
            <div className="w-20 h-1 bg-red-500 rounded-full my-4" />
            <div className="flex flex-wrap justify-center gap-6 text-white text-sm font-medium">
              <span className="flex items-center gap-2">
                <MdLocationOn className="text-red-400" />
                {jobDetails.location}
              </span>
              <span className="flex items-center gap-2">
                <MdAccessTime className="text-red-400" />
                {jobDetails.is_fulltime ? "Full-Time" : "Part-Time"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mt-10">
          <div className="w-full lg:w-2/3 space-y-8">
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-red-600 mb-6">
                Qualifications
              </h2>
              <ul className="space-y-3 text-gray-700 text-sm">
                {jobDetails.qualifications.map((item) => (
                  <li
                    key={crypto.randomUUID()}
                    className="flex items-start gap-3"
                  >
                    <MdChevronRight className="text-red-500 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-red-600 mb-6">
                Requirements
              </h2>
              <ul className="space-y-3 text-gray-700 text-sm">
                {jobDetails.requirements.map((item) => (
                  <li
                    key={crypto.randomUUID()}
                    className="flex items-start gap-3"
                  >
                    <MdChevronRight className="text-red-500 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-red-600 mb-6">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={crypto.randomUUID()}
                    className="bg-red-100 text-red-700 px-4 py-1 rounded-full text-sm font-medium"
                  >
                    {tag.skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 bg-white/40 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-xl p-8 space-y-8">
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Job Summary
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>
                  <span className="font-semibold">Published:</span>{" "}
                  {formatDate(jobDetails.created_at)}
                </li>
                <li>
                  <span className="font-semibold">Job Nature:</span>{" "}
                  {jobDetails.is_fulltime ? "Full-Time" : "Part-Time"}
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
              {isAuthenticated ? (
                <>
                  <button
                    className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold py-2 rounded-xl shadow-md hover:scale-105 transition-all"
                    onClick={() => router.push(`/candidates/${jobId}`)}
                    type="button"
                  >
                    See Applicants
                  </button>
                  <button
                    className="w-full bg-white/60 backdrop-blur-md border border-red-500 text-red-600 font-semibold py-2 rounded-xl hover:bg-red-50 transition-all"
                    onClick={() =>
                      setStates((prev) => ({
                        ...prev,
                        showDeleteModal: true,
                      }))
                    }
                    type="button"
                  >
                    Delete Job
                  </button>
                  <button
                    className="w-full bg-white/60 backdrop-blur-md border border-gray-400 text-gray-700 font-semibold py-2 rounded-xl hover:bg-gray-100 transition-all"
                    onClick={() => router.push(`/joblisting/${jobId}/edit`)}
                    type="button"
                  >
                    Edit Job
                  </button>
                </>
              ) : (
                <button
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold py-2 rounded-xl shadow-md hover:scale-105 transition-all"
                  disabled={states.isApplying}
                  onClick={() =>
                    router.push(
                      `/joblisting/${jobId}/application/form` as Route,
                    )
                  }
                  type="button"
                >
                  {states.isApplying ? "Applying..." : "Apply"}
                </button>
              )}
              <button
                className="w-full bg-gray-200/70 text-gray-700 font-semibold py-2 rounded-xl hover:bg-gray-300 transition-all"
                onClick={() => router.back()}
                type="button"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
