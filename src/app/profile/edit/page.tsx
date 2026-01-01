"use client";

import { UserForm } from "@/components/common/UserForm";
import useAuth from "@/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import {
  SocialLink,
  EducationalDetail,
  JobExperience,
  User,
} from "@/types/types";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { cleanArrayData } from "@/lib/library";
import { swalSuccess, swalError } from "@/lib/swal";

export default function EditProfilePage() {
  const router = useRouter();

  const { userInfo: userInfoHook, csrfToken } = useAuth({
    fetchUser: true,
    fetchSkills: true,
    fetchSocialLinks: true,
    fetchEducation: true,
    fetchExperience: true,
  });

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [educationalDetails, setEducationalDetails] = useState<
    EducationalDetail[]
  >([]);
  const [jobExperiences, setJobExperience] = useState<JobExperience[]>([]);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);

  const [inputFields, setInputFields] = useState<User>({
    prefix: "",
    firstName: "",
    lastName: "",
    countryCode: "",
    street: "",
    zip: "",
    city: "",
    state_: "",
    country: "",
    jobTitle: "",
    email: "",
    mobileNumber: "",
    resumeId: "",
    skillSet: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!userInfoHook.isSuccess) return;

    setSocialLinks(
      userInfoHook.data.socialLinks?.map((link, index) => ({
        id: index,
        value: link,
      })) ?? []
    );

    setEducationalDetails(
      userInfoHook.data.education?.map((edu, index) => ({
        id: index,
        institute: edu.institute || "",
        currentlyPursuing: edu.currently_pursuing,
        major: edu.major || "",
        degree: edu.degree || "",
        startMonth: edu.start_month,
        startYear: edu.start_year,
        endMonth: edu.end_month || "",
        endYear: edu.end_year || 0,
      })) ?? []
    );

    setJobExperience(
      userInfoHook.data.experience?.map((exp, index) => ({
        id: index,
        title: exp.title || "",
        company: exp.company || "",
        summary: exp.summary || "",
        currentlyWorking: exp.currently_working,
        startMonth: exp.start_month,
        startYear: exp.start_year,
        endMonth: exp.end_month || "",
        endYear: exp.end_year || 0,
      })) ?? []
    );

    const user = userInfoHook.data.user;
    if (!user) return;

    setInputFields({
      prefix: user.prefix || "",
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      countryCode: user.country_code || "",
      street: user.street || "",
      zip: user.zip || "",
      city: user.city || "",
      state_: user.state || "",
      country: user.country || "",
      jobTitle: user.job_title || "",
      email: auth.currentUser?.email || "",
      mobileNumber: user.phone_number || "",
      resumeId: user.resume_id,
      skillSet: (userInfoHook.data.skills || []).join(", "),
    });
  }, [userInfoHook.isSuccess]);

  const handleFileSelect = (file: File | null) => setSelectedFile(file);
  const handleTranscriptSelect = (file: File | null) => setTranscriptFile(file);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      const res = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "X-CSRF-Token": csrfToken || "",
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Update failed");
      }

      swalSuccess(
        "Profile Updated",
        "Your profile has been updated successfully.",
        () => router.push("/profile")
      );
    } catch (error) {
      swalError(
        "Error",
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userInfoHook.isLoading || !userInfoHook.isEnabled) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 text-red-600"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <p className="mt-3 text-gray-600">Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl px-4 py-2">
        <UserForm
          userInfo={{ user: inputFields, setUserInfo: setInputFields }}
          socialLinksInfo={{ socialLinks, setSocialLinks }}
          educationalDetailsInfo={{
            educationalDetails,
            setEducationalDetails,
          }}
          jobExperiencesInfo={{ jobExperiences, setJobExperience }}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
          handleFileSelect={handleFileSelect}
          title="Update Profile"
          description="Update your resume and personal information"
          fileName={userInfoHook.data?.user?.resume_id || "No file selected"}
          handleTranscriptSelect={handleTranscriptSelect}
          transcriptFileName={
            userInfoHook.data?.user?.transcript_id || "No file selected"
          }
        />

        <button
          onClick={() => router.back()}
          className="w-full mt-4 bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded transition hover:bg-gray-200"
        >
          Back
        </button>
      </div>
    </div>
  );
}
