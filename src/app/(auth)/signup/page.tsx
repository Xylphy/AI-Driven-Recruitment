"use client";

import { signup } from "@/lib/actionServer";
import { useState, use } from "react";
import { UserForm } from "@/components/common/UserForm";
import { EducationalDetail, JobExperience, SocialLink } from "@/types/types";
import { getCsrfToken } from "@/lib/library";

export default function SignupPage() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [educationalDetails, setEducationalDetails] = useState<
    EducationalDetail[]
  >([]);
  const [jobExperiences, setJobExperience] = useState<JobExperience[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [response, setResponse] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const csrfToken = use(getCsrfToken());

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!csrfToken) {
      setResponse({
        success: false,
        message: "CSRF token is missing. Please try again.",
      });
      return;
    }

    const form = e.currentTarget; // To prevent getting affected by React's synthetic event system

    if (csrfToken === null) {
      setResponse({
        success: false,
        message: "CSRF token is missing. Please try again.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(form);

      formData.set("educationalDetails", JSON.stringify(educationalDetails));
      formData.set("socialLinks", JSON.stringify(socialLinks));
      formData.set("jobExperiences", JSON.stringify(jobExperiences));

      if (selectedFile) {
        formData.set("resume", selectedFile);
      }

      formData.set("csrfToken", csrfToken);

      const result = await signup(formData);
      setResponse(result);

      if (result.success) {
        form.reset();
        setSocialLinks([]);
        setEducationalDetails([]);
        setJobExperience([]);
        setSelectedFile(null);
      }
    } catch (error) {
      setResponse({
        success: false,
        message: `An unexpected error occurred. ${
          error instanceof Error ? error.message : ""
        }`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <UserForm
      socialLinksInfo={{ socialLinks, setSocialLinks }}
      educationalDetailsInfo={{ educationalDetails, setEducationalDetails }}
      jobExperiencesInfo={{ jobExperiences, setJobExperience }}
      handleSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      handleFileSelect={handleFileSelect}
      response={response}
      description="Join a community of innovators, problem-solvers, and change-makers."
      title="REGISTRATION"
    />
  );
}
