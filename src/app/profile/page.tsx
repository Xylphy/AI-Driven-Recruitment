"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase/firebase";
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
import useCsrfToken from "../hooks/useCsrfToken";
import { checkAuthStatus } from "../lib/library";

export default function Profile() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [information, setInformation] = useState({
    firstName: "",
    lastName: "",
    isAdmin: false,
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { csrfToken } = useCsrfToken();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setIsAuthenticated(false);
        router.push("/login");
      } else {
        setIsAuthenticated(true);
      }
    });

    setIsLoading(true);

    const setInfo = async () => {
      if (!csrfToken || !isAuthenticated) {
        return;
      }

      if (!(await checkAuthStatus(csrfToken))) {
        auth.signOut();
        router.push("/login");
        return;
      }

      fetch("/api/users/userDetails", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) {
            alert("Failed to fetch user data, user details");
            auth.signOut();
            return null;
          }
          return res.json();
        })
        .then((body) => {
          if (body) {
            setInformation({
              firstName: body.data.firstName,
              lastName: body.data.lastName,
              isAdmin: body.data.isAdmin,
            });
            setIsLoading(false);
          }
        })
        .catch(() => {
          auth.signOut();
          router.push("/login");
          return;
        });
    };

    setInfo();

    return () => unsubscribe();
  }, [router, csrfToken, isAuthenticated]);

  const jobApplications = [
    {
      id: 1,
      title: "Systems Administrator",
      dateApplied: "March 10, 2025",
    },
    {
      id: 2,
      title: "Technical Support Staff",
      dateApplied: "April 2, 2025",
    },
    {
      id: 3,
      title: "Software Developer",
      dateApplied: "May 1, 2025",
    },
    {
      id: 4,
      title: "Systems Administrator",
      dateApplied: "March 10, 2025",
    },
    {
      id: 5,
      title: "Technical Support Staff",
      dateApplied: "April 2, 2025",
    },
    {
      id: 6,
      title: "Software Developer",
      dateApplied: "May 1, 2025",
    },
    {
      id: 7,
      title: "Systems Administrator",
      dateApplied: "March 10, 2025",
    },
    {
      id: 8,
      title: "Technical Support Staff",
      dateApplied: "April 2, 2025",
    },
    {
      id: 9,
      title: "Software Developer",
      dateApplied: "May 1, 2025",
    },
  ];
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
              {isLoading ? (
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
                className="mt-4 bg-blue-600 text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-blue-600 hover:border-blue-600 flex items-center justify-center gap-2"
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
                <span className="text-red-600">Applied</span> Jobs
              </h2>
              <div className="relative w-5 h-5">
                <MdNotifications className="w-6 h-6" />
                <div className="absolute top-0 left-3 w-3 h-3 bg-red-600 rounded-full z-10" />
              </div>
            </div>
            <div className="space-y-5 pb-9 overflow-y-auto h-full">
              <JobApplicationDetails jobApplications={jobApplications} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
