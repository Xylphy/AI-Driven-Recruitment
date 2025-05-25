"use client";
import { UserForm } from "@/components/common/UserForm";
import useAuth from "@/hooks/useAuth";
import { useState } from "react";
import { SocialLink, EducationalDetail, JobExperience } from "@/types/types";

export default function EditProfilePage() {
  const { information, isAuthLoading, isAuthenticated } = useAuth();
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

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
  };

  if (isAuthLoading) {
    return <div>Loading...</div>;
  }

  return (
    <UserForm
      socialLinksInfo={{ socialLinks, setSocialLinks }}
      educationalDetailsInfo={{
        educationalDetails,
        setEducationalDetails,
      }}
      jobExperiencesInfo={{
        jobExperiences,
        setJobExperience,
      }}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
      handleFileSelect={handleFileSelect}
      response={response}
    />
  );
}
