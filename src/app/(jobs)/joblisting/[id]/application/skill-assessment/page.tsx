"use client";

import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { swalError, swalSuccess } from "@/lib/swal";
import { trpc } from "@/lib/trpc/client";
import type { Tags } from "@/types/schema";
import type { SocialLink } from "@/types/types";

interface Skills extends Tags {
  rating?: number;
}

interface ApplicationDraft {
  basicFields: Record<string, string>;
  socialLinks: SocialLink[];
  resumeURL: string;
  transcriptURL: string;
  csrfToken: string;
}

export default function SkillAssessmentPage() {
  const router = useRouter();
  const { id: jobId } = useParams();
  const fetchTags = trpc.joblisting.fetchTags.useQuery({
    jobId: jobId as string,
  });
  const applyForJob = trpc.joblisting.applyForJob.useMutation();

  const [tags, setTags] = useState<Skills[]>([]);
  const [applicationDraft, setApplicationDraft] =
    useState<ApplicationDraft | null>(null);

  useEffect(() => {
    if (fetchTags.data?.tags) {
      setTags(fetchTags.data.tags);
    }
  }, [fetchTags.data?.tags]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedDraft = sessionStorage.getItem(
      `applicationDraft:${jobId as string}`,
    );

    if (savedDraft) {
      try {
        setApplicationDraft(JSON.parse(savedDraft) as ApplicationDraft);
      } catch {
        setApplicationDraft(null);
      }
    }
  }, [jobId]);

  const handleCompleteApplication = async () => {
    if (!applicationDraft) {
      swalError(
        "Missing Application Data",
        "Please complete the application form before skill assessment.",
      );
      router.push(`/joblisting/${jobId as string}/application/form` as Route);
      return;
    }

    if (!jobId) {
      swalError(
        "Invalid Job Listing",
        "The job listing you are applying for is invalid. Please start your application again.",
      );
      router.push(`/joblisting/${jobId as string}/application/form` as Route);
      return;
    }

    const hasUnratedSkills = tags.some((tag) => !tag.rating);
    if (tags.length > 0 && hasUnratedSkills) {
      swalError(
        "Incomplete Skill Ratings",
        "Please provide a rating for all listed skills.",
      );
      return;
    }

    const { basicFields, resumeURL, transcriptURL, socialLinks } =
      applicationDraft;

    const trackingId = await applyForJob.mutateAsync({
      jobId: jobId as string,
      resumeURL,
      transcriptURL,
      firstName: basicFields.firstName ?? "",
      lastName: basicFields.lastName ?? "",
      email: basicFields.email ?? "",
      contactNumber: basicFields.mobileNumber ?? "",
      street: basicFields.street ?? "",
      zip: basicFields.zip ?? "",
      city: basicFields.city ?? "",
      state: basicFields.state ?? "",
      socialLinks,
      skills: tags.map(({ id, rating }) => ({
        id,
        rating: rating || 0,
      })),
    });

    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`applicationDraft:${jobId as string}`);
      }

      swalSuccess(
        "Application Submitted",
        `Your application has been submitted successfully. Tracking ID: ${trackingId.trackingId}`,
        () => router.push(`/joblisting/${jobId as string}` as Route),
      );
    } catch (error) {
      swalError(
        "Submission Failed",
        error instanceof Error
          ? error.message
          : "Failed to submit your application.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-100 via-white to-red-50 px-6 py-12 flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="mb-12">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="w-12 h-12 flex items-center justify-center  rounded-full text-sm font-bold bg-linear-to-br from-red-600 to-rose-500 text-white shadow-lg shadow-red-500/30">
                1
              </div>

              <span className="ml-3 text-sm font-semibold text-red-600 tracking-wide">
                Application Form
              </span>
            </div>
            <div className="flex-1 h-0.5 mx-6 bg-linear-to-r from-red-600 to-rose-500 rounded-full" />

            <div className="flex items-center">
              <div className="w-12 h-12 flex items-center justify-center  rounded-full text-sm font-bold bg-linear-to-br from-red-600 to-rose-500 text-white shadow-lg shadow-red-500/30">
                2
              </div>

              <span className="ml-3 text-sm font-semibold text-red-600 tracking-wide">
                Skill Assessment
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-2xl p-10 relative">
          <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-red-500/10 via-transparent to-black/10 pointer-events-none" />
          <div className="relative">
            <h1 className="text-3xl font-bold text-red-600 mb-2 text-center">
              SKILL ASSESSMENT
            </h1>
            <p className="text-gray-600 mb-8 text-center text-sm">
              Please rate your proficiency in the following skills before
              completing your application.
            </p>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-md border border-white/40"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{tag.name}</p>
                    <p className="text-xs text-gray-500">
                      Rate from 1 (Beginner) to 5 (Expert)
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => {
                      const isSelected = tag.rating === num;

                      return (
                        <button
                          key={num}
                          type="button"
                          className={`w-9 h-9 rounded-full border text-sm font-semibold transition ${
                            isSelected
                              ? "bg-red-600 text-white border-red-600"
                              : "border-gray-300 text-gray-700 bg-white/70 hover:bg-red-600 hover:text-white hover:border-red-600"
                          }`}
                          onClick={() =>
                            setTags((prevTags) =>
                              prevTags.map((t) =>
                                t.id === tag.id ? { ...t, rating: num } : t,
                              ),
                            )
                          }
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-between gap-3">
              <button
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                onClick={() => router.back()}
                type="button"
              >
                Back to Application
              </button>

              <button
                className="px-6 py-2 rounded-lg bg-linear-to-r from-red-600 to-red-500 text-white font-bold shadow-lg hover:scale-[1.02] transition"
                type="button"
                onClick={handleCompleteApplication}
              >
                Complete Application
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
