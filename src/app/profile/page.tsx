"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase/firebase";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

export default function HomePage() {
  // const router = useRouter();

  // onAuthStateChanged(auth, (user) => {
  //   if (user) {
  //     alert("User is logged in");
  //   } else {
  //     router.push("/");
  //   }
  // });

  return (
    <>
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">My Profile</h1>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Left side - Profile picture and name */}
              <div className="md:w-1/3">
                <div className="flex flex-col items-center">
                  <div className="w-40 h-40 bg-gray-300 rounded-full mb-4 overflow-hidden">
                    <img
                      src="/placeholder-avatar.png"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-semibold mb-4">
                    Lastname, First Name
                  </h2>
                  <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
                    Upload Photo
                  </button>
                </div>
              </div>

              {/* Right side - Applied jobs */}
              <div className="md:w-2/3">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Applied Jobs</h2>
                  <button className="p-2 relative">
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      3
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 flex items-center">
                  <div className="h-16 w-16 bg-gray-200 rounded-md overflow-hidden mr-4">
                    <img
                      src="/company-logo-2.png"
                      alt="Company"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">
                      Frontend Developer at Design Inc.
                    </h3>
                    <p className="text-sm text-gray-600">
                      Applied on: May 10, 2023
                    </p>
                  </div>
                  <button className="bg-blue-600 text-white py-1 px-3 rounded-md text-sm hover:bg-blue-700 transition">
                    Track Application
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 flex items-center">
                  <div className="h-16 w-16 bg-gray-200 rounded-md overflow-hidden mr-4">
                    <img
                      src="/company-logo-2.png"
                      alt="Company"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">Cherry lyn</h3>
                    <p className="text-sm text-gray-600">
                      Applied on: May 10, 2023
                    </p>
                  </div>
                  <button className="bg-blue-600 text-white py-1 px-3 rounded-md text-sm hover:bg-blue-700 transition">
                    Track Application
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 flex items-center">
                  <div className="h-16 w-16 bg-gray-200 rounded-md overflow-hidden mr-4">
                    <img
                      src="/company-logo-2.png"
                      alt="Company"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">Santa Ugma Na</h3>
                    <p className="text-sm text-gray-600">
                      Applied on: May 10, 2023
                    </p>
                  </div>
                  <button className="bg-blue-600 text-white py-1 px-3 rounded-md text-sm hover:bg-blue-700 transition">
                    Track Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
