"use client";

import { FaFacebook, FaInstagram } from "react-icons/fa";
import { MdEmail, MdPhone } from "react-icons/md";
import Image from "next/image";
import { startTransition, useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { CANDIDATE_STATUSES } from "@/lib/constants";
import dynamic from "next/dynamic";

type CandidateStatus = (typeof CANDIDATE_STATUSES)[number];

// Dynamic imports for CandidateProfile and CandidateResume components
// Has a separate chunk instead of being included in the main bundle
const CandidateProfile = dynamic(
  () => import("@/components/admin/candidateProfile/CandidateProfile"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full">
        <span className="text-gray-500 animate-pulse">
          Loading candidate evaluation...
        </span>
      </div>
    ),
  }
);

const CandidateResume = dynamic(
  () => import("@/components/admin/candidateProfile/CandidateResume"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full">
        <span className="text-gray-500 animate-pulse">Loading resume...</span>
      </div>
    ),
  }
);

export default function Page() {
  const router = useRouter();
  const candidateId = useParams().id as string; // userId
  const [selectedStatus, setSelectedStatus] = useState<CandidateStatus | null>(
    null
  );
  const { isAuthenticated } = useAuth();

  const userJWT = trpc.auth.decodeJWT.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const candidateProfileQuery = trpc.candidate.fetchCandidateProfile.useQuery(
    {
      candidateId: candidateId,
      fetchScore: true,
      fetchTranscribed: true,
      fetchResume: true,
    },
    {
      enabled: isAuthenticated && userJWT.data?.user.role !== "User",
    }
  );
  const updateCandidateStatusMutation =
    trpc.candidate.updateCandidateStatus.useMutation();

  const [onResume, setOnResume] = useState(false);

  useEffect(() => {
    if (userJWT.isLoading || !isAuthenticated) {
      return;
    }

    if (!userJWT.data?.user.role) {
      alert("You are not authorized to view this page.");
      if (window.history.length > 0) {
        router.back();
      } else {
        router.push("/profile");
      }
    }
  }, [userJWT.data?.user.role, router]);

  useEffect(() => {
    startTransition(() =>
      setSelectedStatus(candidateProfileQuery.data?.status ?? null)
    );
  }, [candidateProfileQuery.data?.status]);

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value as CandidateStatus | null;
    const oldStatus = selectedStatus;

    setSelectedStatus(newStatus);
    await updateCandidateStatusMutation.mutateAsync(
      {
        applicantId: candidateId,
        newStatus: newStatus,
      },
      {
        onSuccess: () => {
          alert("Candidate status updated successfully.");
        },
        onError: (error: unknown) => {
          alert(error instanceof Error ? error.message : String(error));
          setSelectedStatus(oldStatus);
        },
      }
    );
  };

  return (
    <main className="bg-white h-[75vh] overflow-hidden">
      <div className="container mx-auto px-4 h-full">
        <div className="bg-white rounded-lg max-w-6xl mx-auto h-full flex">
          <div className="w-full md:w-1/3 border-r border-gray-300 p-6 flex flex-col items-center bg-white">
            <label
              htmlFor="profile-upload"
              className="relative inline-block w-40 h-40 rounded-full overflow-hidden cursor-pointer group"
            >
              <Image
                src="/logo.png"
                alt="Profile"
                width={160}
                height={160}
                className="object-cover rounded-full w-full h-full"
              />
            </label>

            <h2 className="text-lg font-semibold mt-4 text-center">
              {!candidateProfileQuery.data ? (
                <div className="animate-pulse">
                  <div className="w-24 h-4 bg-gray-300 rounded"></div>
                  <div className="w-16 h-4 bg-gray-300 rounded mt-2"></div>
                </div>
              ) : (
                <span>
                  {candidateProfileQuery.data.user.firstName}{" "}
                  {candidateProfileQuery.data.user.lastName}
                </span>
              )}
            </h2>

            <div className="flex gap-3 my-4">
              <MdEmail className="text-red-600" />
              <FaFacebook className="text-red-600" />
              <FaInstagram className="text-red-600" />
              <MdPhone className="text-red-600" />
            </div>
            <div className="mt-4">
              <label
                htmlFor="status"
                className="block text-sm text-center font-semibold text-gray-700 mb-1"
              >
                Candidate Status
              </label>
              <select
                id="status"
                value={selectedStatus || ""}
                onChange={handleStatusChange}
                className="bg-red-600 text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-600 hover:border-red-600 focus:outline-none"
              >
                <option value="">Select Status</option>
                {CANDIDATE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-4 my-4">
              <button
                onClick={() => setOnResume(!onResume)}
                className="bg-[#E30022] text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
              >
                {onResume ? "VIEW EVALUATION" : "VIEW RESUME"}
              </button>
            </div>
          </div>
          {onResume ? (
            <CandidateResume candidateProfile={candidateProfileQuery.data} />
          ) : (
            <CandidateProfile candidateProfile={candidateProfileQuery.data} />
          )}
        </div>
      </div>
    </main>
  );
}
