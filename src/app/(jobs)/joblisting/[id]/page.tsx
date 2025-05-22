"use client";

import { MdLocationOn, MdAccessTime, MdChevronRight } from "react-icons/md";
import Image from "next/image";
import useAuth from "@/app/hooks/useAuth";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { JobListing } from "@/app/types/schema";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: jobId } = use(params);
  const { information, isAuthLoading, isAuthenticated, csrfToken } = useAuth();
  const [jobLoading, isJobLoading] = useState(true);

  const [jobDetails, setJobDetails] = useState<
    Omit<JobListing, "created_by"> & {
      requirements: string[];
    } & {
      qualifications: string[];
    }
  >({
    id: "",
    title: "",
    location: "",
    is_fulltime: true,
    created_at: "",
    requirements: [],
    qualifications: [],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    fetch(`/api/jobDetails?job=${jobId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken!,
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
  }, [isAuthenticated]);

  if (isAuthLoading || jobLoading) {
    return <div>Loading...</div>;
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

            <button className="mt-6 w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700 transition">
              {information.isAdmin ? "See Applicants" : "Apply Now"}
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.back()}
        className="mt-4 bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-gray-500 hover:border-gray-500"
      >
        Back
      </button>
    </main>
  );
}
