"use client";

import { useEffect, useState } from "react";
import { ApplicationForm } from "@/components/common/ApplicationForm";
import { getCsrfToken } from "@/lib/library";
import type {
  EducationalDetail,
  JobExperience,
  SocialLink,
} from "@/types/types";

export default function ApplicationPage() {
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
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [transcriptFileName, setTranscriptFileName] = useState<
    string | undefined
  >();

  const handleTranscriptSelect = (file: File | null) => {
    setTranscriptFileName(file ? file.name : undefined);
  };

  useEffect(() => {
    const fetchCsrfToken = async () => {
      setCsrfToken(await getCsrfToken());
    };
    fetchCsrfToken();
  }, []);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!csrfToken) {
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

            <div className="flex-1 h-0.5 mx-6 bg-gray-300 rounded-full" />

            <div className="flex items-center">
              <div
                className="w-12 h-12 flex items-center justify-center 
        rounded-full text-sm font-bold
        bg-gray-200 text-gray-500"
              >
                2
              </div>

              <span className="ml-3 text-sm font-medium text-gray-500 tracking-wide">
                Skill Assessment
              </span>
            </div>
          </div>
        </div>

        <ApplicationForm
          socialLinksInfo={{ socialLinks, setSocialLinks }}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          handleFileSelect={handleFileSelect}
          response={response}
          description="Complete your application details to proceed to the skill assessment."
          title="APPLICATION"
          handleTranscriptSelect={handleTranscriptSelect}
          transcriptFileName={transcriptFileName}
        />
      </div>
    </div>
  );
}
