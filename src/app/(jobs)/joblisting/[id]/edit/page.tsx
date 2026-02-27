"use client";

import { useParams, useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import ListInputSection from "@/components/joblisting/Qualifications";
import useAuth from "@/hooks/useAuth";
import { JOB_LOCATIONS } from "@/lib/constants";
import { swalError, swalInfo, swalSuccess } from "@/lib/swal";
import { trpc } from "@/lib/trpc/client";
import type { JobListing, Tags } from "@/types/types";

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
    <div
      className="
        relative
        min-h-screen
        w-full
        flex
        items-center
        justify-center
        bg-linear-to-br from-white via-red-50/30 to-white
        px-4
        py-16
      "
    >
      <div className="absolute -top-40 -left-40 w-112.5 h-112.5 bg-red-400/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-112.5 h-112.5 bg-red-500/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-3xl">
        <div
          className="
        relative
        rounded-4xl
        border border-white/40
        bg-white/55
        backdrop-blur-3xl
        shadow-[0_40px_120px_rgba(220,38,38,0.15)]
        p-10
        overflow-hidden
      "
        >
          <div className="absolute inset-0 bg-linear-to-br from-white/40 via-transparent to-red-100/30 pointer-events-none" />

          <div className="relative">
            <div className="text-center mb-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-red-600">
                Recruitment Panel
              </p>
              <h1 className="mt-3 text-3xl font-extrabold bg-linear-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                Update Job Listing
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Update your job listing and find the best talent.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label
                  htmlFor="title"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-red-600"
                >
                  Job Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={jobListing.title}
                  onChange={handleInputChange}
                  required
                  maxLength={255}
                  className="
                w-full rounded-2xl px-5 py-3
                bg-white/70 backdrop-blur-xl
                border border-white/40
                text-gray-700 font-semibold
                shadow-[0_15px_50px_rgba(220,38,38,0.08)]
                focus:ring-2 focus:ring-red-400/40 focus:border-red-300
                transition-all duration-300 outline-none
              "
                />
              </div>

              <ListInputSection
                items={jobListing.qualifications || []}
                title="Qualifications"
                update={(id, value) =>
                  handleUpdate("qualifications", id, value)
                }
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
                readOnly={true}
              />

              <div className="space-y-3">
                <label
                  htmlFor="location"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-red-600"
                >
                  Job Location
                </label>

                <select
                  id="location"
                  name="location"
                  value={jobListing.location}
                  onChange={handleInputChange}
                  required
                  className="
                    w-full rounded-2xl px-5 py-3
                    bg-white/70 backdrop-blur-xl
                    border border-white/40
                    text-gray-700 font-semibold
                    shadow-[0_15px_50px_rgba(220,38,38,0.08)]
                    focus:ring-2 focus:ring-red-400/40 focus:border-red-300
                    transition-all duration-300 outline-none
                  "
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
              </div>

              {(role === "Admin" || role === "SuperAdmin") && (
                <div className="space-y-3">
                  <label
                    htmlFor="hrSearch"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-red-600"
                  >
                    Assigned HR Officer
                  </label>

                  <div className="relative">
                    <input
                      id="hrSearch"
                      type="text"
                      value={hrSearch}
                      onChange={(e) => {
                        setHrSearch(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Type to search HR Officer"
                      required
                      className="
                          w-full rounded-2xl px-5 py-3
                          bg-white/70 backdrop-blur-xl
                          border border-white/40
                          text-gray-700 font-semibold
                          shadow-[0_15px_50px_rgba(220,38,38,0.08)]
                          focus:ring-2 focus:ring-red-400/40 focus:border-red-300
                          transition-all duration-300 outline-none
                        "
                    />

                    {showDropdown && filteredHROfficers.length > 0 && (
                      <ul
                        className="
                    absolute z-20 mt-2 w-full
                    rounded-2xl
                    border border-white/40
                    bg-white/80 backdrop-blur-2xl
                    shadow-[0_20px_60px_rgba(220,38,38,0.12)]
                    max-h-56 overflow-y-auto
                  "
                      >
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
                                e.preventDefault();
                                setHROfficer(officer);
                                setShowDropdown(false);
                                setHrSearch(
                                  `${officer.first_name} ${officer.last_name}`,
                                );
                              }
                            }}
                            className="px-5 py-3 cursor-pointer hover:bg-red-50 focus:bg-red-100 focus:outline-none transition"
                          >
                            {officer.first_name} {officer.last_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              <div
                className="
            flex items-center gap-3
            rounded-2xl
            border border-white/40
            bg-white/50
            backdrop-blur-xl
            p-4
          "
              >
                <input
                  type="checkbox"
                  id="isFullTime"
                  checked={jobListing.isFullTime}
                  onChange={(e) =>
                    setJobListing((prev) => ({
                      ...prev,
                      isFullTime: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 accent-red-600"
                />
                <label
                  htmlFor="isFullTime"
                  className="text-sm font-semibold text-gray-700"
                >
                  Full Time Position
                </label>
              </div>

              <div className="flex gap-4 justify-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                relative rounded-2xl px-8 py-3
                font-bold uppercase tracking-[0.18em]
                bg-linear-to-r from-red-600 to-red-500
                text-white
                shadow-[0_25px_80px_rgba(220,38,38,0.25)]
                hover:scale-[1.02]
                transition-all duration-300
                disabled:opacity-60 disabled:cursor-not-allowed
              "
                >
                  {isSubmitting ? "Processing..." : "Submit Listing"}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  className="
                rounded-2xl px-8 py-3
                font-bold uppercase tracking-[0.18em]
                bg-white/60 backdrop-blur-md
                border border-white/40
                text-gray-700
                shadow-sm
                hover:bg-white/80
                transition
              "
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
