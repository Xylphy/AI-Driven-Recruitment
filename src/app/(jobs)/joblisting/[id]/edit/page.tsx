"use client";

import { useEffect, useState } from "react";
import { JobListing } from "@/types/types";
import Qualifications from "@/components/joblisting/Qualifications";
import useAuth from "@/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import { JOB_LOCATIONS } from "@/lib/constants";
import { getCsrfToken } from "@/lib/library";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const [isSubmitting] = useState(false);

  const [jobListing, setJobListing] = useState<
    Omit<JobListing, "created_at"> & {
      isFullTime: boolean;
    }
  >({
    title: "",
    qualifications: [],
    requirements: [],
    location: "",
    isFullTime: true,
  });
  const { information, isAuthLoading } = useAuth(undefined, true);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!information.admin) {
      alert("You are not authorized to create a job listing");
      router.push("/profile");
    }

    fetch(`/api/jobDetails?job=${jobId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          alert("Failed to fetch job details");
        }

        return res.json();
      })
      .then((data) => {
        setJobListing({
          ...data,
          qualifications:
            data.qualifications.map((qualification, index) => ({
              title: qualification,
              id: index,
            })) || [],
          requirements:
            data.requirements.map((requirement, index) => ({
              title: requirement,
              id: index,
            })) || [],
          isFullTime: data.is_fulltime,
        });
      });
  }, [information, router, isAuthLoading]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setJobListing((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = (field: "qualifications" | "requirements") => {
    setJobListing((prev) => {
      return {
        ...prev,
        [field]: [...prev[field], { id: Date.now(), title: "" }],
      };
    });
  };

  const handleUpdate = (
    field: "qualifications" | "requirements",
    id: number,
    value: string
  ) => {
    setJobListing((prev) => ({
      ...prev,
      [field]: prev[field].map((item) =>
        item.id === id ? { ...item, title: value } : item
      ),
    }));
  };

  const handleDelete = (
    field: "qualifications" | "requirements",
    id: number
  ) => {
    setJobListing((prev) => ({
      ...prev,
      [field]: prev[field].filter((item) => item.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!information.admin) {
      alert("You are not authorized to create a job listing");
      router.push("/profile");
    }

    fetch(`/api/joblistings?jobId=${jobId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": (await getCsrfToken())!,
      },
      body: JSON.stringify({ ...jobListing, jobId }),
    }).then((response) => {
      if (response.ok) {
        alert("Job listing updated successfully");
      } else {
        alert("Failed to update job listing");
      }
    });
  };

  return (
    <div className="flex flex-col justify-center items-center mt-10">
      <h1 className="text-4xl font-bold text-[#E30022] text-center mb-2 uppercase tracking-wide">
        UPDATE JOB LISTING
      </h1>
      <hr className="w-1/4 mx-auto border-t border-black-600 my-1" />
      <p className="text-center text-sm text-gray-700 mt-2 mb-6">
        Update your job listing and find the best talent.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl mt-6 space-y-4">
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Job Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={jobListing.title}
            onChange={handleInputChange}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md"
            required
            maxLength={255}
          />
        </div>

        <Qualifications
          items={jobListing.qualifications}
          title="Qualifications"
          update={(id, value) => handleUpdate("qualifications", id, value)}
          deleteItem={(id) => handleDelete("qualifications", id)}
          add={() => handleAdd("qualifications")}
        />

        <Qualifications
          items={jobListing.requirements}
          title="Requirements"
          update={(id, value) => handleUpdate("requirements", id, value)}
          deleteItem={(id) => handleDelete("requirements", id)}
          add={() => handleAdd("requirements")}
        />

        <div className="mb-4">
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Job Location
          </label>
          <select
            id="location"
            name="location"
            value={jobListing.location}
            onChange={handleInputChange}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="" disabled>
              Select a location
            </option>
            {JOB_LOCATIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          <div className="mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFullTime"
                name="isFullTime"
                checked={jobListing.isFullTime}
                onChange={(e) =>
                  setJobListing((prev) => ({
                    ...prev,
                    isFullTime: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label
                htmlFor="isFullTime"
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                Full Time Position
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#E30022] text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
          >
            {isSubmitting ? "Processing..." : "Submit Listing"}
          </button>
        </div>
      </form>

      <button
        onClick={() => router.back()}
        className="mt-4 bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-gray-500 hover:border-gray-500"
      >
        Back
      </button>
    </div>
  );
}
