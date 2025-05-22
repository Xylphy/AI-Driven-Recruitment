"use client";

import { FaFacebook, FaInstagram } from "react-icons/fa";
import {
  MdEmail,
  MdPhone,
  MdNotifications,
  MdSettings,
  MdLogout,
} from "react-icons/md";
import JobApplicationDetails from "@/app/components/profile/JobApplications";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { JobListing } from "../types/schema";
import useAuth from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import { auth } from "@/app/lib/firebase/firebase";

export default function Profile() {
  const router = useRouter();

  const [jobListed, setJobListed] = useState<{
    createdByThem: JobListing[];
    createdByOthers: JobListing[];
  }>({
    createdByThem: [],
    createdByOthers: [],
  });

  const { information, isAuthLoading, isAuthenticated, csrfToken } = useAuth();
  const [isJobLoading, setIsJobLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const fetchContent = async () => {
      fetch("/api/joblisting", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken!,
        },
      })
        .then((res) => {
          if (!res.ok) {
            alert("Failed to fetch job listings");
            return null;
          }
          return res.json();
        })
        .then((body) => {
          if (!body) {
            return;
          }
          if (information.isAdmin) {
            const formatJobDate = (
              job: Pick<JobListing, "title" | "created_at">
            ) => ({
              ...job,
              created_at: new Date(job.created_at).toLocaleDateString(),
            });

            setJobListed({
              createdByThem: body.data.createdByThem.map(formatJobDate),
              createdByOthers: body.data.createdByAll.map(formatJobDate),
            });
          }
        })
        .finally(() => {
          setIsJobLoading(false);
        });
    };

    fetchContent();
  }, [information]);

  if (isAuthLoading || isJobLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 mb-8 border-4 border-[#E30022] border-t-transparent rounded-full"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-gray-800"
          >
            Loading
            <motion.span
              animate={{
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
              }}
            >
              ...
            </motion.span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-gray-600 mt-2"
          >
            Preparing your experience
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-white h-[75vh] overflow-hidden">
      <div className="container mx-auto px-4 h-full">
        <div className="bg-white rounded-lg max-w-6xl mx-auto h-full flex">
          <div className="w-full md:w-1/3 border-r border-gray-300 p-6 flex flex-col items-center bg-white">
            <label
              htmlFor="profile-upload"
              className="relative inline-block w-40 h-40 rounded-full overflow-hidden cursor-pointer group"
            >
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                className="hidden"
              />
              <Image
                src="/logo.png"
                alt="Profile"
                width={160}
                height={160}
                className="object-cover rounded-full w-full h-full"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-50 transition-opacity duration-200">
                <span className="text-white font-medium">Update Picture</span>
              </div>
            </label>

            <h2 className="text-lg font-semibold mt-4 text-center">
              {isAuthLoading || isJobLoading ? (
                <div className="animate-pulse">
                  <div className="w-24 h-4 bg-gray-300 rounded"></div>
                  <div className="w-16 h-4 bg-gray-300 rounded mt-2"></div>
                </div>
              ) : (
                <span>
                  {information.firstName || "No"}{" "}
                  {information.lastName || "Name"}
                </span>
              )}
            </h2>

            <div className="flex gap-3 my-4">
              <MdEmail className="text-red-600" />
              <FaFacebook className="text-red-600" />
              <FaInstagram className="text-red-600" />
              <MdPhone className="text-red-600" />
            </div>
            {information.isAdmin && (
              <button
                onClick={() => router.push("/createjob")}
                className="mt-4 bg-red-600 text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-600 hover:border-red-600 flex items-center justify-center gap-2"
              >
                <span>Add Job Listing</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}

            <div className="flex flex-col gap-4 my-6 mt-auto">
              <div className="flex gap-4 justify-center">
                <MdSettings className="cursor-pointer hover:text-red-600" />
                <MdLogout
                  onClick={() => {
                    auth.signOut();
                    router.push("/login");
                  }}
                  className="cursor-pointer hover:text-red-600"
                />
              </div>

              <button className="bg-[#E30022] text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500">
                EDIT PROFILE
              </button>
            </div>
          </div>

          <div className="w-full md:w-2/3 p-6  ">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">
                {information.isAdmin ? (
                  <>
                    <span className="text-red-600">Job</span> Listed{" "}
                  </>
                ) : (
                  <>
                    <span className="text-red-600">Applied</span> Jobs
                  </>
                )}
              </h2>
              <div className="relative w-5 h-5">
                <MdNotifications className="w-6 h-6" />
                <div className="absolute top-0 left-3 w-3 h-3 bg-red-600 rounded-full z-10" />
              </div>
            </div>
            <div className="space-y-5 pb-9 overflow-y-auto h-full">
              <JobApplicationDetails
                jobApplications={
                  information.isAdmin
                    ? jobListed.createdByThem
                    : jobListed.createdByOthers
                }
                isAdmin={information.isAdmin}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
