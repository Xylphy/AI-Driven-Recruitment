"use client";

import { useEffect, useState } from "react";
import { JobListing, QualificationOrRequirement } from "@/app/types/types";
import Qualifications from "@/app/components/joblisting/Qualifications";

let idCounter = 1;

export default function JobListingPage() {
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const [jobListing, setJobListing] = useState<JobListing>({
    title: "",
    qualifications: [],
    requirements: [],
    location: "",
  });

  useEffect(() => {
    fetch("/api/csrf")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken))
      .catch((err) => alert("CSRF fetch failed: " + err.message));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setJobListing((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = (field: "qualifications" | "requirements") => {
    setJobListing((prev) => ({
      ...prev,
      [field]: [...prev[field], { id: idCounter++, title: "" }],
    }));
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

  return (
    <div className="flex flex-col justify-center items-center mt-10">
      <h1 className="text-4xl font-bold text-[#E30022] text-center mb-2 uppercase tracking-wide">
        CREATE JOB LISTING
      </h1>
      <hr className="w-1/4 mx-auto border-t border-black-600 my-1" />
      <p className="text-center text-sm text-gray-700 mt-2 mb-6">
        Post your job listing and find the best talent.
      </p>

      <form className="w-full max-w-2xl mt-6 space-y-4">
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
            <option value="Cebu City">Cebu City</option>
            <option value="Manila">Manila</option>
            <option value="Tokyo">Tokyo</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex mb-5 justify-center items-center w-full bg-red-600 text-white font-bold px-4 py-3 rounded-md transition-all duration-300 hover:bg-transparent hover:text-red-600 hover:border hover:border-red-600"
        >
          {isSubmitting ? "Processing..." : "Submit Listing"}
        </button>
      </form>
    </div>
  );
}
