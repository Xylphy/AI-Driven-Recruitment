"use client";

import { MdLocationOn, MdAccessTime } from "react-icons/md";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { JobListing } from "@/types/schema";
import Loading from "@/app/loading";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: jobId } = use(params);
  const { information, isAuthenticated, isAuthLoading } = useAuth(
    undefined,
    true
  );
  const [candidatesLoading, isCandidatesLoading] = useState(true);

  // Admin only
  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!information.admin) {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/profile");
      }
    }
  }, [isAuthLoading]);

  // const candidates = [
  //   {
  //     id: "c1",
  //     name: "Jane Doe",
  //     email: "jane.doe@example.com",
  //     score: "100",
  //     resumeLink: "#",
  //   },
  //   {
  //     id: "c2",
  //     name: "John Smith",
  //     email: "john.smith@example.com",
  //     score: "99",
  //     resumeLink: "#",
  //   },
  //   {
  //     id: "c3",
  //     name: "Maria Garcia",
  //     email: "maria.garcia@example.com",
  //     score: "98",
  //     resumeLink: "#",
  //   },
  // ];
  // const [candidates, setCandidates] = useState<
  //   { id: string; name: string; email: string | null; score?: number }[]

  const [jobDetails, setJobDetails] = useState<
    Omit<JobListing, "created_by" | "created_at">
  >({
    id: "",
    title: "",
    location: "",
    is_fulltime: true,
  });

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
      .then((data) => {})
      .catch((error) => {
        console.error("Error fetching job details:", error);
      })
      .finally(() => {
        isCandidatesLoading(false);
      });
  }, [isAuthenticated]);

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
                {/* {candidates.length === 0 ? (
                  <p>No candidates yet.</p>
                ) : (
                  candidates.map((candidate) => (
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
                          {candidate.score ?? 98}% Job Candidate Match
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          router.push(`/candidate/${candidate.id}`)
                        }
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-transparent hover:text-red-600 hover:border hover:border-red-600 transition-all"
                      >
                        See Candidate Profile
                      </button>
                    </li>
                  ))
                )} */}
              </ul>
            </section>
          </div>

          <div className="w-full lg:w-1/3 bg-gray-50 border-l p-6">
            {/* <section className="mb-8">
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
            </section> */}

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
              <button
                onClick={() => router.push(`/joblisting/${jobId}`)}
                className="mt-6 w-full bg-red-600 text-white font-bold py-2 rounded border border-transparent hover:bg-transparent hover:text-red-600 hover:border-red-600"
              >
                See Job Details
              </button>
            )}
            {information.admin && (
              <button className="mt-2 w-full bg-red-600 text-white font-bold py-2 rounded border border-transparent hover:bg-transparent hover:text-red-600 hover:border-red-600">
                Delete Job
              </button>
            )}
            {information.admin && (
              <button className="mt-2 w-full bg-red-600 text-white font-bold py-2 rounded border border-transparent hover:bg-transparent hover:text-red-600 hover:border-red-600">
                Edit Job
              </button>
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
