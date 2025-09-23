"use client";

import { MdLocationOn, MdAccessTime, MdChevronRight } from "react-icons/md";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { JobListing } from "@/types/schema";
import Loading from "@/app/loading";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: jobId } = use(params);
  const { information, isAuthenticated, csrfToken } = useAuth({
    fetchAdmin: true,
    routerActivation: false,
  });
  const [jobLoading, isJobLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const [jobDetails, setJobDetails] = useState<
    Omit<JobListing, "created_by"> & {
      requirements: string[];
      qualifications: string[];
      isApplicant: boolean;
      tags: string[];
    }
  >({
    id: "",
    title: "",
    location: "",
    is_fulltime: true,
    created_at: "",
    joblisting_id: "",
    requirements: [],
    qualifications: [],
    isApplicant: true,
    tags: [],
  });

  const handleApply = async () => {
    setIsApplying(true);
    fetch("/api/jobs/applicants", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken ?? "",
      },
      body: JSON.stringify({ jobId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          alert(data.message);
          setJobDetails((prev) => ({
            ...prev,
            isApplicant: true,
          }));
          return;
        }

        throw new Error(data.error);
      })
      .catch(() =>
        alert("Failed to apply for the job. Please try again later.")
      )
      .finally(() => setIsApplying(false));
  };

  useEffect(() => {
    fetch(`/api/jobDetails?job=${jobId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch job details");
        }
        return res.json();
      })
      .then((data) => {
        setJobDetails({
          ...data,
          created_at: new Date(data.created_at).toLocaleDateString(),
        });
      })
      .catch((error) => {
        alert(error.message);
      })
      .finally(() => {
        isJobLoading(false);
      });
  }, []);

  const handleDeleteJob = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/joblistings?jobId=${jobId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete job");
      }

      alert("Job deleted successfully");
      router.push("/profile");
    } catch {
      alert("Error deleting job");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (jobLoading) {
    return <Loading />;
  }

  return (
    <main className="bg-white min-h-screen py-5 px-4 md:px-20">
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this job listing? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteJob}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="relative h-44">
          <Image
            src="/workspace.jpg"
            alt="Header Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/75 z-10" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
            <h1 className="text-3xl font-bold text-center text-white">
              {jobDetails.title}
            </h1>
            <hr className="w-1/2 mx-auto border-t border-red-600 my-2" />
            <div className="flex justify-center mt-2 space-x-4 text-white font-medium text-sm">
              <span className="flex items-center gap-1">
                <MdLocationOn className="text-red-600" /> {jobDetails.location}
              </span>
              <span className="flex items-center gap-1">
                <MdAccessTime className="text-red-600" />{" "}
                {jobDetails.is_fulltime ? "Full-Time" : "Part-Time"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row py-5">
          <div className="w-full lg:w-2/3 p-8">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Qualifications
              </h2>
              <ul className="space-y-2 text-gray-700 text-sm">
                {jobDetails.qualifications.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <MdChevronRight className="text-red-600 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Requirements
              </h2>
              <ul className="space-y-2 text-gray-700 text-sm">
                {jobDetails.requirements.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <MdChevronRight className="text-red-600 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-red-600 mb-4">Tags</h2>
              <ul className="space-y-2 text-gray-700 text-sm">
                {jobDetails.tags.map((tag, index) => (
                  <li
                    key={index}
                    className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm mr-2 mb-2"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="w-full lg:w-1/3 bg-gray-50 border-l p-6">
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Job Summary
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  <strong>Published:</strong> {jobDetails.created_at}
                </li>
                <li>
                  <strong>Job Nature:</strong>{" "}
                  {jobDetails.is_fulltime ? "Full-Time" : "Part-Time"}
                </li>
                <li>
                  <strong>Location:</strong> {jobDetails.location}
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Company Detail
              </h3>
              <p className="text-sm text-gray-700">
                Alliance Software, Inc. is a global IT services and solutions
                company. Established in 2000, Alliance has grown to become one
                of the Philippines’ largest and most respected independent
                software development companies.
              </p>
            </section>

            {information.admin && (
              <>
                <button
                  onClick={() => router.push(`/candidates/${jobId}`)}
                  className="mt-6 w-full bg-red-600 text-white font-bold py-2 rounded border border-transparent hover:bg-transparent hover:text-red-600 hover:border-red-600"
                >
                  See Applicants
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="mt-2 w-full bg-red-600 text-white font-bold py-2 rounded border border-transparent hover:bg-transparent hover:text-red-600 hover:border-red-600"
                >
                  Delete Job
                </button>
                <button
                  className="mt-2 w-full bg-red-600 text-white font-bold py-2 rounded border border-transparent hover:bg-transparent hover:text-red-600 hover:border-red-600"
                  onClick={() => router.push(`/joblisting/${jobId}/edit`)}
                >
                  Edit Job
                </button>
              </>
            )}

            {isAuthenticated && !information.admin && (
              <>
                <button
                  className={`mt-2 w-full font-bold py-2 rounded border border-transparent transition-all duration-300 ease-in-out ${
                    jobDetails.isApplicant
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-transparent hover:text-red-600 hover:border-red-600"
                  }`}
                  onClick={handleApply}
                  disabled={jobDetails.isApplicant || isApplying}
                >
                  {jobDetails.isApplicant
                    ? "Applied"
                    : isApplying
                    ? "Applying..."
                    : "Apply Job"}
                </button>
              </>
            )}

            <button
              onClick={() => router.back()}
              className="mt-2 w-full bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-gray-500 hover:border-gray-500"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
