"use client";

import { useState } from "react";
import {
  MdSettings,
  MdLogout,
  MdArrowBack,
  MdNotifications,
} from "react-icons/md";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdMenu,
  MdClose,
  MdWork,
  MdPeople,
  MdCompareArrows,
  MdDashboard,
  MdError,
} from "react-icons/md";
import { trpc } from "@/lib/trpc/client";
import useAuth from "@/hooks/useAuth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathName = usePathname();
  const jwtDecoded = trpc.auth.decodeJWT.useQuery();
  const {} = useAuth(); // For logout functionality

  if (
    jwtDecoded.isLoading ||
    !jwtDecoded.isSuccess ||
    jwtDecoded.data.user.role === "User" ||
    jwtDecoded.data.user.role === "HR Officer"
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">
            Access Denied
          </h1>
          <p className="text-gray-700">
            You do not have permission to access this page.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-blue-500 hover:underline"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-64 bg-[#E30022] text-white flex flex-col p-6 h-screen overflow-y-auto sticky top-0"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">Admin Panel</h2>
              <MdClose
                className="cursor-pointer text-2xl"
                onClick={() => setIsSidebarOpen(false)}
              />
            </div>

            <nav className="flex flex-col gap-4 h-full">
              <Link
                href="/admin"
                className={`flex items-center gap-3 hover:bg-white/20 px-3 py-2 rounded-md transition ${
                  pathName === "/admin" ? "bg-white/30" : ""
                }`}
              >
                <MdDashboard /> Dashboard
              </Link>

              <Link
                href="/admin/jobs"
                className={`flex items-center gap-3 hover:bg-white/20 px-3 py-2 rounded-md transition ${
                  pathName === "/admin/jobs" ? "bg-white/30" : ""
                }`}
              >
                <MdWork /> Jobs
              </Link>

              <Link
                href="/admin/applicants"
                className={`flex items-center gap-3 hover:bg-white/20 px-3 py-2 rounded-md transition ${
                  pathName === "/admin/applicants" ? "bg-white/30" : ""
                }`}
              >
                <MdPeople /> Candidates
              </Link>

              <Link
                href="/admin/compare"
                className={`flex items-center gap-3 hover:bg-white/20 px-3 py-2 rounded-md transition ${
                  pathName === "/admin/compare" ? "bg-white/30" : ""
                }`}
              >
                <MdCompareArrows /> Compare
              </Link>

              <Link
                href="/admin/bottlenecks"
                className={`flex items-center gap-3 hover:bg-white/20 px-3 py-2 rounded-md transition ${
                  pathName === "/admin/bottlenecks" ? "bg-white/30" : ""
                }`}
              >
                <MdError /> Bottlenecks
              </Link>

              <Link
                href="/admin/auditlogs"
                className={`flex items-center gap-3 hover:bg-white/20 px-3 py-2 rounded-md transition ${
                  pathName === "/admin/auditlogs" ? "bg-white/30" : ""
                }`}
              >
                <MdNotifications /> Audit Logs
              </Link>

              {jwtDecoded.data.user.role === "SuperAdmin" && (
                <Link
                  href="/admin/users"
                  className={`flex items-center gap-3 hover:bg-white/20 px-3 py-2 rounded-md transition ${
                    pathName === "/admin/users" ? "bg-white/30" : ""
                  }`}
                >
                  <MdPeople /> Users
                </Link>
              )}

              {jwtDecoded.data.user.role === "SuperAdmin" && (
                <Link
                  href="/admin/hrofficers"
                  className={`flex items-center gap-3 hover:bg-white/20 px-3 py-2 rounded-md transition ${
                    pathName === "/admin/hrofficers" ? "bg-white/30" : ""
                  }`}
                >
                  <MdPeople /> HR Officers
                </Link>
              )}

              <div className="flex flex-col gap-4 my-6 mt-auto">
                <div className="flex gap-4 justify-center">
                  <MdSettings className="cursor-pointer hover:text-red-300" />
                  <MdLogout
                    onClick={() => auth.signOut()}
                    className="cursor-pointer hover:text-red-300"
                  />
                </div>

                <button
                  onClick={() => router.push("/profile/edit")}
                  className="text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-300"
                >
                  EDIT PROFILE
                </button>
              </div>
            </nav>
          </motion.aside>
        )}
        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow p-4 flex justify-between items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center gap-2 text-[#E30022] font-bold"
            >
              {!isSidebarOpen && (
                <>
                  <MdMenu className="text-2xl" />
                  <span>Show Menu</span>
                </>
              )}
            </button>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 cursor-pointer"
              >
                <MdArrowBack className="text-xl" />
                <span>Visit Site</span>
              </Link>

              <Bell className="w-6 h-6 text-gray-600 hover:text-red-600 cursor-pointer" />

              <Link href="/profile">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-500 hover:border-black transition-all duration-300 cursor-pointer">
                  {/* Profile Image */}
                </div>
              </Link>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </AnimatePresence>
    </div>
  );
}
