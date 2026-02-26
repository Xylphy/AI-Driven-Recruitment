"use client";

import { useParams, useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import ListInputSection from "@/components/joblisting/Qualifications";
import useAuth from "@/hooks/useAuth";
import { JOB_LOCATIONS } from "@/lib/constants";
import { trpc } from "@/lib/trpc/client";
import type { JobListing, Tags } from "@/types/types";
import { swalInfo, swalSuccess, swalError } from "@/lib/swal";

type HROfficer = {
  id: string;
  first_name: string;
  last_name: string;
};

export default function Page() {
  const router = useRouter();
  const jobId = useParams().id as string;
  const [isSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [HROfficer, setHROfficer] = useState<HROfficer | null>(null);
  const [hrSearch, setHrSearch] = useState("");

  const userJWT = trpc.auth.decodeJWT.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { role, id: userId } = userJWT.data?.user || {};

  const hrOfficersQuery = trpc.admin.fetchHrOfficers.useQuery(
    {
      query: hrSearch,
      currentHRId: HROfficer?.id || undefined,
    },
    {
      enabled: role === "Admin" || role === "SuperAdmin",
    },
  );
  const filteredHROfficers = useMemo(
    () => hrOfficersQuery.data?.hrOfficers || [],
    [hrOfficersQuery.data?.hrOfficers],
  );

  const [jobListing, setJobListing] = useState<
    Omit<JobListing, "created_at"> & {
      isFullTime: boolean;
      assignedHR?: string | null;
    } & Tags
  >({
    title: "",
    qualifications: [],
    requirements: [],
    tags: [],
    location: "Cebu City",
    isFullTime: true,
  });

  const joblistingDetails = trpc.joblisting.getJobDetails.useQuery(
    { jobId },
    {
      enabled: isAuthenticated,
    },
  );
  const updateJoblisting = trpc.joblisting.updateJoblisting.useMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      swalInfo(
        "Login Required",
        "You must be logged in to access this page.",
        () => router.push("/login"),
      );
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (joblistingDetails.data?.officer_id) {
      const assignedOfficer = filteredHROfficers.find(
        (officer) => officer.id === joblistingDetails.data?.officer_id,
      );

      if (assignedOfficer) {
        startTransition(() => setHROfficer(assignedOfficer));
        startTransition(() => setShowDropdown(false));
        startTransition(() =>
          setHrSearch(
            `${assignedOfficer.first_name} ${assignedOfficer.last_name}`,
          ),
        );
      }
    }
  }, [joblistingDetails.data?.officer_id, filteredHROfficers]);

  useEffect(() => {
    if (joblistingDetails.data) {
      startTransition(() =>
        setJobListing({
          title: joblistingDetails.data.title,
          qualifications: joblistingDetails.data.qualifications.map(
            (qualification, index) => ({
              title: qualification,
              id: index,
            }),
          ),
          requirements: joblistingDetails.data.requirements.map(
            (requirement, index) => ({
              title: requirement,
              id: index,
            }),
          ),
          tags: joblistingDetails.data.tags.map((tags, index) => ({
            title: tags,
            id: index,
          })),
          location: joblistingDetails.data.location,
          isFullTime: true,
        }),
      );
    }
  }, [joblistingDetails.data]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setJobListing((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = (field: "qualifications" | "requirements" | "tags") => {
    setJobListing((prev) => {
      return {
        ...prev,
        [field]: [...prev[field], { id: Date.now(), title: "" }],
      };
    });
  };

  const handleUpdate = (
    field: "qualifications" | "requirements" | "tags",
    id: number,
    value: string,
  ) => {
    setJobListing((prev) => ({
      ...prev,
      [field]: prev[field].map((item) =>
        item.id === id ? { ...item, title: value } : item,
      ),
    }));
  };

  const handleDelete = (
    field: "qualifications" | "requirements" | "tags",
    id: number,
  ) => {
    setJobListing((prev) => ({
      ...prev,
      [field]: prev[field].filter((item) => item.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || joblistingDetails.data?.created_by !== userId) {
      swalError(
        "Unauthorized",
        "You are not authorized to edit this job listing.",
        () => router.push("/login"),
      );
    }

    await updateJoblisting.mutateAsync(
      {
        jobId,
        title: jobListing.title,
        qualifications: jobListing.qualifications,
        requirements: jobListing.requirements,
        tags: jobListing.tags,
        location: jobListing.location,
        isFullTime: jobListing.isFullTime,
        hrOfficerId: HROfficer?.id ?? undefined,
      },
      {
        onSuccess: (data) => {
          swalSuccess("Updated Successfully", data.message, () => {
            router.refresh();
          });
        },
        onError: (error) => {
          swalError(
            "Update Failed",
            `Failed to update job listing: ${error.message}`,
          );
        },
      },
    );
  };

  useEffect(() => {
    if (!isAuthenticated) {
      swalInfo(
        "Login Required",
        "You must be logged in to access this page.",
        () => router.push("/login"),
      );
    }
  }, [isAuthenticated, router]);

  if (joblistingDetails.isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-10 animate-pulse space-y-4">
        <div className="h-10 bg-gray-300 rounded w-3/5 mx-auto" />
        <hr className="w-1/4 mx-auto border-t border-black-600 my-1" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />

        <form className="w-full max-w-2xl mt-6 space-y-4">
          <div className="mb-4">
            <div className="h-12 bg-gray-200 rounded w-full" />
          </div>

          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded w-full" />
            <div className="h-10 bg-gray-200 rounded w-full" />
            <div className="h-10 bg-gray-200 rounded w-full" />
          </div>

          <div className="mb-4">
            <div className="h-12 bg-gray-200 rounded w-full" />
          </div>

          <div className="flex justify-center">
            <div className="h-10 w-40 bg-gray-300 rounded" />
          </div>
        </form>

        <div className="flex justify-center mt-4">
          <div className="h-10 w-24 bg-gray-300 rounded" />
        </div>
      </div>
    );
  }

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

        <ListInputSection
          items={jobListing.qualifications || []}
          title="Qualifications"
          update={(id, value) => handleUpdate("qualifications", id, value)}
          deleteItem={(id) => handleDelete("qualifications", id)}
          add={() => handleAdd("qualifications")}
        />

        <ListInputSection
          items={jobListing.requirements || []}
          title="Requirements"
          update={(id, value) => handleUpdate("requirements", id, value)}
          deleteItem={(id) => handleDelete("requirements", id)}
          add={() => handleAdd("requirements")}
        />

        <ListInputSection
          items={jobListing.tags || []}
          title="Tags"
          update={(id, value) => handleUpdate("tags", id, value)}
          deleteItem={(id) => handleDelete("tags", id)}
          add={() => handleAdd("tags")}
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

          {(role === "Admin" || role === "SuperAdmin") && (
            <>
              <label
                htmlFor="hr_officer"
                className="block text-sm font-medium text-gray-700"
              >
                Assigned HR Officer
              </label>

              <div className="relative mt-1">
                <input
                  type="text"
                  id="hr_officer"
                  value={hrSearch}
                  onChange={(e) => {
                    setHrSearch(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Type to search HR Officer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
                {showDropdown && filteredHROfficers.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow max-h-48 overflow-y-auto">
                    {filteredHROfficers.map((officer) => (
                      <li
                        key={officer.id}
                        onClick={() => {
                          setHROfficer(officer);
                          setShowDropdown(false);
                          setHrSearch(
                            `${officer.first_name} ${officer.last_name}`,
                          );
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault(); // prevents page scroll on Space
                            setHROfficer(officer);
                            setShowDropdown(false);
                            setHrSearch(
                              `${officer.first_name} ${officer.last_name}`,
                            );
                          }
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        {officer.first_name} {officer.last_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

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
        className="mt-4 bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-gray-500 hover:border-gray-500"
        onClick={() => router.back()}
        type="button"
      >
        Back
      </button>
    </div>
  );
}
