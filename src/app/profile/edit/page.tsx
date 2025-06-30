"use client";
import { UserForm } from "@/components/common/UserForm";
import useAuth from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import {
  SocialLink,
  EducationalDetail,
  JobExperience,
  User,
} from "@/types/types";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { checkAuthStatus, cleanArrayData } from "@/lib/library";
import { useCsrfStore } from "@/lib/store";

export default function EditProfilePage() {
  const router = useRouter();
  const { information, isAuthLoading } = useAuth(
    true,
    false,
    true,
    true,
    true,
    true
  );
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [educationalDetails, setEducationalDetails] = useState<
    EducationalDetail[]
  >([]);
  const [jobExperiences, setJobExperience] = useState<JobExperience[]>([]);

  const [userInfo, setUserInfo] = useState<User>({
    // Initialize with default values
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
    public_id: "",
    skillSet: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [response, setResponse] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;

    setSocialLinks(
      information.socialLinks.map((link, index) => {
        return {
          id: index,
          value: link || "",
        };
      })
    );

    setEducationalDetails(
      information.education.map((edu, index) => ({
        id: index,
        institute: edu.institute || "",
        currentlyPursuing: edu.currently_pursuing,
        major: edu.major || "",
        degree: edu.degree || "",
        startMonth: edu.start_month,
        startYear: edu.start_year,
        endMonth: edu.end_month || "",
        endYear: edu.end_year || 0,
      }))
    );

    setJobExperience(
      information.experience.map((experience, index) => ({
        id: index,
        title: experience.title || "",
        company: experience.company || "",
        summary: experience.summary || "",
        currentlyWorking: experience.currently_working,
        startMonth: experience.start_month,
        startYear: experience.start_year,
        endMonth: experience.end_month || "",
        endYear: experience.end_year || 0,
      }))
    );

    setUserInfo({
      prefix: information.user?.prefix || "",
      firstName: information.user?.first_name || "",
      lastName: information.user?.last_name || "",
      countryCode: information.user?.country_code || "",
      street: information.user?.street || "",
      zip: information.user?.zip || "",
      city: information.user?.city || "",
      state_: information.user?.state || "",
      country: information.user?.country || "",
      jobTitle: information.user?.job_title || "",
      email: auth.currentUser?.email || "",
      mobileNumber: information.user?.phone_number || "",
      public_id: information.user?.resume_id || "",
      skillSet: information.skills.join(", ") || "",
    });
  }, [isAuthLoading]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget; // To prevent getting affected by React's synthetic event system

    if (!(await checkAuthStatus())) {
      alert("Authentication failed. Please log in again.");
      auth.signOut();
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(formElement);

    const keysToDelete = [];

    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value.trim() === "")
        keysToDelete.push(key);
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

    try {
      fetch("/api/users", {
        method: "PUT",
        headers: {
          "X-CSRF-Token": useCsrfStore.getState().csrfToken || "",
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
        .catch((error) => {
          console.error("Error updating profile:", error);
          setResponse({
            success: false,
            message: "Failed to update profile.",
          });
        });

      setResponse(null);
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return <div>Loading...</div>;
  }

  return (
    <UserForm
      userInfo={{ user: userInfo, setUserInfo }}
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
      title="Update Profile"
      description="WAHAHAHAAHAHAHA"
      fileName={information.user?.resume_id || "No file selected"}
    />
  );
}
