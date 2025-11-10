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
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // resume
  const [response, setResponse] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = controllerRef.current;
    return () => controller?.abort(); // cancel the request on unmount
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
      userInfoHook.data.experience?.map((experience, index) => ({
        id: index,
        title: experience.title || "",
        company: experience.company || "",
        summary: experience.summary || "",
        currentlyWorking: experience.currently_working,
        startMonth: experience.start_month,
        startYear: experience.start_year,
        endMonth: experience.end_month || "",
        endYear: experience.end_year || 0,
      })) ?? []
    );

    const userData = userInfoHook.data.user;
    if (userData)
      setInputFields({
        prefix: userData.prefix || "",
        firstName: userData.first_name || "",
        lastName: userData.last_name || "",
        countryCode: userData.country_code || "",
        street: userData.street || "",
        zip: userData.zip || "",
        city: userData.city || "",
        state_: userData.state || "",
        country: userData.country || "",
        jobTitle: userData.job_title || "",
        email: auth.currentUser?.email || "",
        mobileNumber: userData.phone_number || "",
        resumeId: userData.resume_id,
        skillSet: (userInfoHook.data.skills || []).join(", "),
      });
  }, [userInfoHook.isSuccess]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget; // To prevent getting affected by React's synthetic event system

    setIsSubmitting(true);

    const formData = new FormData(formElement);
    const keysToDelete = [];

    // Cleanup empty string fields
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value.trim() === "") {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      formData.delete(key);
    });

    formData.set(
      "educationalDetails",
      JSON.stringify(
        cleanArrayData(
          educationalDetails as unknown as Record<string, unknown>[],
          ["institute", "major", "endMonth"]
        )
      )
    );

    formData.set(
      "socialLinks",
      JSON.stringify(
        cleanArrayData(socialLinks as unknown as Record<string, unknown>[], [
          "value",
        ])
      )
    );

    formData.set(
      "jobExperiences",
      JSON.stringify(
        cleanArrayData(jobExperiences as unknown as Record<string, unknown>[], [
          "title",
          "company",
          "summary",
          "endMonth",
        ])
      )
    );

    if (selectedFile) {
      formData.set("resume", selectedFile);
    }
    if (transcriptFile) {
      formData.set("video", transcriptFile);
    }

    try {
      fetch("/api/users", {
        method: "PUT",
        headers: {
          "X-CSRF-Token": csrfToken || "",
        },
        signal: controllerRef.current?.signal,
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          if (data.error) {
            setResponse({ success: false, message: data.error });
          } else {
            router.refresh();
            setResponse({
              success: true,
              message: "Profile updated successfully!",
            });
          }
        })
        .catch(() => {
          setResponse({
            success: false,
            message: "Failed to update profile.",
          });
        });

      setResponse(null);
    } catch {
    } finally {
      controllerRef.current = null;
      setIsSubmitting(false);
    }
  };

  const handleTranscriptSelect = (file: File | null) => {
    setTranscriptFile(file);
  };

  if (userInfoHook.isLoading || !userInfoHook.isEnabled) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 text-red-600"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
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
          educationalDetailsInfo={{ educationalDetails, setEducationalDetails }}
          jobExperiencesInfo={{ jobExperiences, setJobExperience }}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
          handleFileSelect={handleFileSelect}
          response={response}
          title="Update Profile"
          description="Update your resume and personal information"
          fileName={userInfoHook.data?.user?.resume_id || "No file selected"}
          handleTranscriptSelect={handleTranscriptSelect}
          transcriptFileName={
            userInfoHook.data?.user?.transcript_id || "No file selected"
          }
        />
      </div>
    </div>
  );
}
