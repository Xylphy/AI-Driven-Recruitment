"use client";

import { useEffect, useState } from "react";
import { checkAuthStatus, getCsrfToken } from "@/lib/library";
import { JobListing } from "@/types/schema";
import useAuth from "@/hooks/useAuth";

export default function Careers() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [jobs, setJobs] = useState<(JobListing & { applied: boolean })[]>();

  const { information } = useAuth(undefined, isAuthenticated);

  useEffect(() => {
    checkAuthStatus().then(setIsAuthenticated);

    fetch("/api/jobs", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setJobs(data.data || []))
      .catch(() =>
        alert("Failed to fetch job listings. Please try again later.")
      );
  }, []);

  const handleApply = async (jobId: string) => {
    fetch("/api/jobs/applicants", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": (await getCsrfToken()) || "",
      },
      body: JSON.stringify({ jobId }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.error || data.message);
        setJobs((prevJobs) =>
          prevJobs?.map((job) =>
            job.id === jobId ? { ...job, applied: true } : job
          )
        );
      })
      .catch(() => {
        alert("Failed to apply for the job. Please try again later.");
      });
  };

  return (
    <div className="text-gray-800">
      <section
        className="relative w-full h-[300px] bg-cover bg-center"
        style={{ backgroundImage: "url('/workspace.jpg')" }}
      >
        <div className="absolute inset-0 bg-black bg-black/50 flex flex-col items-center justify-center">
          <h1 className="text-white text-4xl sm:text-5xl font-bold">CAREERS</h1>
          <hr className="w-1/4 mx-auto border-t border-red-600 my-1" />
          <p className="text-white max-w-3xl text-center">
            Alliance Software, Inc. is the Philippines’ largest independent
            Filipino software development and business solutions company.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4 px-5 border-r">
          <input
            type="text"
            placeholder="Job Title"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="Location"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          <button className="bg-[#E30022] text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500">
            Search
          </button>
        </div>

        <div className="md:col-span-2 space-y-4 overflow-y-auto max-h-[500px] pr-2">
          {jobs?.map((job, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:shadow"
            >
              <div>
                <h3 className="text-lg font-bold">{job.title}</h3>
                <div className="text-sm text-gray-600 flex items-center space-x-2">
                  <span>📍 {job.location}</span>
                  <span>•</span>
                  <span>{job.is_fulltime ? "Full-time" : "Part-time"}</span>
                </div>
              </div>
              {isAuthenticated && !information.admin && (
                <button
                  className={`font-bold px-4 py-2 rounded border transition-all duration-300 ease-in-out ${
                    job.applied
                      ? "bg-gray-400 text-gray-600 border-gray-400 cursor-not-allowed"
                      : "bg-[#E30022] text-white border-transparent hover:bg-transparent hover:text-red-500 hover:border-red-500"
                  }`}
                  onClick={() => !job.applied && handleApply(job.id)}
                  disabled={job.applied}
                >
                  {job.applied ? "Applied" : "Apply Now"}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Company Activities */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-6 text-red-600 text-center">
            Company <span className="text-black">Activities</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-md shadow p-4 text-center"
                >
                  <div className="h-24 bg-gray-200 rounded mb-2"></div>
                  <p className="text-sm font-medium">Activity Name</p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Company Benefits */}
      <section className="bg-white py-10">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-6 text-red-600 text-center">
            Company <span className="text-black">Benefits</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-md shadow p-4 text-center"
                >
                  <div className="h-24 bg-gray-200 rounded mb-2"></div>
                  <p className="text-sm font-medium">Benefit Name</p>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
