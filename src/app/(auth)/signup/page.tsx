"use client";

import { useState, useEffect } from "react";
import { UserForm } from "@/components/common/UserForm";
import { EducationalDetail, JobExperience, SocialLink } from "@/types/types";
import { cleanArrayData, getCsrfToken } from "@/lib/library";

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
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);

  const handleTranscriptSelect = (file: File | null) => {
    setTranscriptFile(file);
  };

  useEffect(() => {
    getCsrfToken().then(setCsrfToken);
  }, []);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; // To prevent getting affected by React's synthetic event system

    setIsSubmitting(true);

    const formData = new FormData(form);
    const keysToDelete = [];

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

    fetch("/api/users/signup", {
      method: "POST",
      headers: {
        "X-CSRF-Token": csrfToken || "",
      },
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setResponse(data);
        form.reset();
        setSocialLinks([]);
        setEducationalDetails([]);
        setJobExperience([]);
        setSelectedFile(null);
        setTranscriptFile(null);
      })
      .catch((error) => {
        setResponse({
          success: false,
          message: error instanceof Error ? error.message : "Submission failed",
        });
      })
      .finally(() => setIsSubmitting(false));
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
      handleTranscriptSelect={handleTranscriptSelect}
      transcriptFileName={transcriptFile?.name}
    />
  );
}
