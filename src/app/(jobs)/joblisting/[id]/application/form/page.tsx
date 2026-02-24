"use client";

import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ApplicationForm } from "@/components/common/ApplicationForm";
import { getCsrfToken } from "@/lib/library";
import type { SocialLink } from "@/types/types";

const applicationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email address"),
  mobileNumber: z.string(),
});

export default function ApplicationPage() {
  const router = useRouter();
  const { id: jobId } = useParams();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTranscript, setSelectedTranscript] = useState<File | null>(
    null,
  );
  const [response, setResponse] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const handleTranscriptSelect = (file: File | null) => {
    setSelectedTranscript(file);
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

    const validationResult = applicationSchema.safeParse(
      Object.fromEntries(new FormData(form).entries()),
    );

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map((issue) => issue.message)
        .join(", ");
      setResponse({
        success: false,
        message: errorMessages,
      });
      return;
    }
    // Validate required files
    if (!selectedFile) {
      setResponse({
        success: false,
        message: "Please select a resume file.",
      });
      return;
    }

    if (!selectedTranscript) {
      setResponse({
        success: false,
        message: "Please select an interview video.",
      });
      return;
    }

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
      const basicFields = Object.fromEntries(
        Array.from(formData.entries())
          .filter(([, value]) => typeof value === "string")
          .map(([key, value]) => [key, value as string]),
      );

      const uploadData = new FormData();
      if (selectedFile) {
        uploadData.append("resume", selectedFile);
      }
      if (selectedTranscript) {
        uploadData.append("transcript", selectedTranscript);
      }
      const { resumeURL, transcriptURL } = await fetch("/api/uploadFiles", {
        method: "POST",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        body: uploadData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            throw new Error(data.message || "File upload failed");
          }
          return data;
        });

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          `applicationDraft:${jobId as string}`,
          JSON.stringify({
            basicFields,
            socialLinks,
            resumeURL,
            transcriptURL,
          }),
        );
      }

      setResponse({
        success: true,
        message: "Application details saved. Continue with skill assessment.",
      });

      router.push(
        `/joblisting/${jobId as string}/application/skill-assessment` as Route,
      );
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
              <div className="w-12 h-12 flex items-center justify-center rounded-full text-sm font-bold bg-gray-200 text-gray-500">
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
        />
      </div>
    </div>
  );
}
