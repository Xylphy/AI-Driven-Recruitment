"use client";

import { FaFacebook, FaInstagram } from "react-icons/fa";
import {
  MdEmail,
  MdPhone,
  MdNotifications,
  MdSettings,
  MdLogout,
  MdClose,
  MdDelete,
} from "react-icons/md";
import JobApplicationDetails from "@/components/profile/JobApplications";
import Image from "next/image";
import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { trpc } from "@/lib/trpc/client";
import useNotifications from "@/hooks/useNotifications";
import { formatDate } from "@/lib/library";

export default function Profile() {
  const router = useRouter();
  const { userInfo, isAuthenticated } = useAuth({
    fetchUser: true,
  });
  const jwtInfo = trpc.auth.decodeJWT.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const isAdmin = userInfo.isSuccess && jwtInfo.data?.user.isAdmin;
  const joblistings = trpc.joblisting.joblistings.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(undefined, jwtInfo.data?.user.id);

  const clickNotification = (notificationId: string) => {
    markAsRead(notificationId);
    router.push(
      (notifications.find((n) => n.id === notificationId)?.link ??
        "/") as unknown as Parameters<typeof router.push>[0]
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
                {isAdmin ? (
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
                <button
                  onClick={() => setShowNotifications(true)}
                  className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MdNotifications className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {unreadCount}
                      </span>
                    </div>
                  )}
                </button>
              </div>
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
                  jobApplications={
                    isAdmin
                      ? joblistings.data?.joblistings ?? []
                      : joblistings.data?.joblistings ?? []
                  }
                  isAdmin={!!isAdmin}
                />
              )}
            </div>
          </div>
        </div>
        {showNotifications && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-96 flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <MdClose className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${
                          !notification.isRead ? "bg-blue-50" : ""
                        }`}
                        onClick={() => clickNotification(notification.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-gray-600 text-xs mt-1">
                              {notification.body}
                            </p>
                            <span className="text-gray-400 text-xs">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>

                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-red-600 p-1"
                            aria-label="Delete notification"
                          >
                            <MdDelete className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t">
                <button
                  onClick={markAllAsRead}
                  className="w-full text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
