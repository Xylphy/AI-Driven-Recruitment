"use client";

import { MdLocationOn, MdAccessTime } from "react-icons/md";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading";
import { JobListing } from "@/types/schema";

interface Candidate {
  id: string;
  name: string;
  email?: string;
  predictiveSuccess?: number;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: jobId } = use(params);
  const { information, isAuthenticated, isAuthLoading } = useAuth(
    undefined,
    true
  );
  const [candidatesLoading, isCandidatesLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>();
  const [jobDetails, setJobDetails] = useState<Omit<JobListing, "created_by">>({
    id: "",
    title: "",
    location: "",
    is_fulltime: true,
    created_at: "",
    joblisting_id: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Admin only
  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!information.admin) {
      alert("You are not authorized to view this page.");
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/profile");
      }
    }
  }, [isAuthLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    fetch(`/api/jobs/applicants?jobId=${jobId}`, {
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
        setCandidates(data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching job details:", error);
      })
      .finally(() => {
        isCandidatesLoading(false);
      });

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
        alert("Error fetching job details: " + error.message);
      });
  }, [isAuthenticated]);

  const handleDeleteJob = async () => {
    fetch(`/api/joblisting/${jobId}`, {
      method: "DELETE",
    }).then((res) => {
      if (!res.ok) {
        alert("Failed to delete job listing");
        return;
      }
      alert("Job listing deleted successfully");
      router.push("/profile");
    });
  };

  if (candidatesLoading) {
    return <Loading />;
  }

  return (
    <main className="bg-white min-h-screen py-5 px-4 md:px-20">
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
                Applicants for this job
              </h2>
              <ul className="space-y-4 text-gray-700 text-sm">
                {candidates?.length === 0 ? (
                  <p>No candidates yet.</p>
                ) : (
                  candidates?.map((candidate) => (
                    <li
                      key={candidate.id}
                      className="flex items-center justify-between border p-4 rounded shadow-sm"
                    >
                      <div>
                        <p className="font-semibold">{candidate.name}</p>
                        <p className="text-xs text-gray-500">
                          {candidate.email || "No email"}
                        </p>
                        <p className="text-xs text-green-600 font-semibold mt-1">
                          {candidate.predictiveSuccess || 0} % Job Candidate
                          Match
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          router.push(`/candidateprofile/${candidate.id}`)
                        }
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-transparent hover:text-red-600 hover:border hover:border-red-600 transition-all"
                      >
                        See Candidate Profile
                      </button>
                    </li>
                  ))
                )}
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
                  onClick={() => router.push(`/joblisting/${jobId}`)}
                  className="mt-6 w-full bg-red-600 text-white font-bold py-2 rounded border border-transparent hover:bg-transparent hover:text-red-600 hover:border-red-600"
                >
                  See Job Details
                </button>
                <button
                  className="mt-2 w-full bg-red-600 text-white font-bold py-2 rounded border border-transparent hover:bg-transparent hover:text-red-600 hover:border-red-600"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Job
                </button>
                <button
                  className="mt-2 w-full bg-red-600 text-white font-bold py-2 rounded border border-transparent hover:bg-transparent hover:text-red-600 hover:border-red-600"
                  onClick={() => router.push(`/joblisting/${jobId}/edit`)}
                >
                  Edit Job
                </button>
                <button
                  onClick={() => router.back()}
                  className="mt-2 w-full bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-gray-500 hover:border-gray-500"
                >
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this job?</p>
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded font-bold"
                onClick={handleDeleteJob}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
