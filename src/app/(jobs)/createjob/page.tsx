"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ListInputSection from "@/components/joblisting/Qualifications";
import useAuth from "@/hooks/useAuth";
import { JOB_LOCATIONS } from "@/lib/constants";
import { swalConfirm, swalError, swalSuccess } from "@/lib/swal";
import { trpc } from "@/lib/trpc/client";
import type { JobListing, Tags } from "@/types/types";

export default function JobListingPage() {
  const router = useRouter();
  const [isSubmitting] = useState(false);
  const [jobListing, setJobListing] = useState<JobListing & Tags>({
    title: "",
    qualifications: [],
    requirements: [],
    tags: [],
    location: "Cebu City",
    isFullTime: true,
  });
  const { isAuthenticated } = useAuth();
  const userJWT = trpc.auth.decodeJWT.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { role } = userJWT.data?.user || {};
  const createJoblisting = trpc.joblisting.createJoblisting.useMutation();
  const [hrSearch, setHrSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [hrOfficerId, setHrOfficerId] = useState<string | null>(null);

  const hrOfficersQuery = trpc.admin.fetchHrOfficers.useQuery(
    {
      query: hrSearch,
    },
    {
      enabled: isAuthenticated,
    },
  );

  const filteredHROfficers = hrOfficersQuery.data?.hrOfficers || [];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setJobListing((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = (field: "qualifications" | "requirements" | "tags") => {
    setJobListing((prev) => ({
      ...prev,
      [field]: [...prev[field], { id: prev[field].length + 1, title: "" }],
    }));
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

    if (role !== "Admin" && role !== "SuperAdmin") {
      swalError(
        "Unauthorized",
        "You are not authorized to create a job listing.",
      );
      router.push("/login");
    }

    swalConfirm(
      "Finalize tags?",
      "Tags will be finalized and cannot be modified after job creation. Do you want to continue?",
      async () => {
        await createJoblisting.mutateAsync(
          {
            title: jobListing.title,
            qualifications: jobListing.qualifications,
            requirements: jobListing.requirements,
            tags: jobListing.tags,
            location: jobListing.location,
            isFullTime: jobListing.isFullTime,
            hrOfficerId: hrOfficerId ?? undefined,
          },
          {
            onSuccess: (data) => {
              swalSuccess("Create Job Listing", data.message);
              setJobListing({
                title: "",
                qualifications: [],
                requirements: [],
                tags: [],
                location: "Cebu City",
                isFullTime: true,
              });
              setHrSearch("");
              setHrOfficerId(null);
            },
            onError: (error) => {
              swalError("Operation Failed", error.message);
            },
          },
        );
      },
    );
  };

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
                Create Job Listing
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Post your job listing and find the best talent.
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
                text-gray-700 font-semibold placeholder:text-gray-400
                shadow-[0_15px_50px_rgba(220,38,38,0.08)]
                focus:ring-2 focus:ring-red-400/40 focus:border-red-300
                transition-all duration-300 outline-none
              "
                />
              </div>

              <ListInputSection
                items={jobListing.qualifications}
                title="Qualifications"
                update={(id, value) =>
                  handleUpdate("qualifications", id, value)
                }
                deleteItem={(id) => handleDelete("qualifications", id)}
                add={() => handleAdd("qualifications")}
              />

              <ListInputSection
                items={jobListing.requirements}
                title="Requirements"
                update={(id, value) => handleUpdate("requirements", id, value)}
                deleteItem={(id) => handleDelete("requirements", id)}
                add={() => handleAdd("requirements")}
              />

              <ListInputSection
                items={jobListing.tags}
                title="Tags"
                update={(id, value) => handleUpdate("tags", id, value)}
                deleteItem={(id) => handleDelete("tags", id)}
                add={() => handleAdd("tags")}
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
                            setHrOfficerId(officer.id);
                            setHrSearch(
                              `${officer.first_name} ${officer.last_name}`,
                            );
                            setShowDropdown(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setHrOfficerId(officer.id);
                              setHrSearch(
                                `${officer.first_name} ${officer.last_name}`,
                              );
                              setShowDropdown(false);
                            }
                          }}
                          className="px-5 py-3 cursor-pointer hover:bg-red-50 transition"
                        >
                          {officer.first_name} {officer.last_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

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
