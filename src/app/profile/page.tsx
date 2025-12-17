"use client";

import { FaFacebook, FaInstagram } from "react-icons/fa";
import { MdEmail, MdPhone, MdSettings, MdLogout } from "react-icons/md";
import JobApplicationDetails from "@/components/profile/JobApplications";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { trpc } from "@/lib/trpc/client";

export default function Profile() {
  const router = useRouter();
  const { userInfo, isAuthenticated } = useAuth({
    fetchUser: true,
  });
  const jwtInfo = trpc.auth.decodeJWT.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const isAdmin = userInfo.isSuccess && jwtInfo.data?.user.role !== "User";
  const joblistings = trpc.joblisting.joblistings.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[75vh]">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Admins do not have a profile page.
        </h2>
        <p className="text-gray-700 mb-6">
          Please go to the admin panel to manage the platform.
        </p>
        <button
          onClick={() => router.push("/admin")}
          className="bg-red-600 text-white font-bold px-6 py-3 rounded transition-all duration-300 hover:bg-transparent hover:text-red-600 hover:border hover:border-red-600"
        >
          Go to Admin Panel
        </button>
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
              {userInfo.isLoading || !userInfo.isSuccess ? (
                <div className="animate-pulse">
                  <div className="w-24 h-4 bg-gray-300 rounded"></div>
                  <div className="w-16 h-4 bg-gray-300 rounded mt-2"></div>
                </div>
              ) : (
                <span>
                  {userInfo.data.user!.first_name || "No"}{" "}
                  {userInfo.data.user!.last_name || "Name"}
                </span>
              )}
            </h2>

            <div className="flex gap-3 my-4">
              <MdEmail className="text-red-600" />
              <FaFacebook className="text-red-600" />
              <FaInstagram className="text-red-600" />
              <MdPhone className="text-red-600" />
            </div>
            {isAdmin && (
              <>
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
                <button
                  onClick={() => router.push("/admin")}
                  className="mt-4 bg-red-600 text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-600 hover:border-red-600 flex items-center justify-center gap-2"
                >
                  Switch to Admin View
                </button>
              </>
            )}

            <div className="flex flex-col gap-4 my-6 mt-auto">
              <div className="flex gap-4 justify-center">
                <MdSettings className="cursor-pointer hover:text-red-600" />
                <MdLogout
                  onClick={() => auth.signOut()}
                  className="cursor-pointer hover:text-red-600"
                />
              </div>

              <button
                onClick={() => router.push("/profile/edit")}
                className="bg-[#E30022] text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
              >
                EDIT PROFILE
              </button>
            </div>
          </div>

          <div className="w-full md:w-2/3 p-6  ">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">
                <span className="text-red-600">Applied</span> Jobs
              </h2>
            </div>
            <div className="space-y-5 pb-9 overflow-y-auto h-full">
              {joblistings.isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-300 rounded w-full"></div>
                </div>
              ) : (
                <JobApplicationDetails
                  jobApplications={{
                    joblistings: joblistings.data?.joblistings ?? [],
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
