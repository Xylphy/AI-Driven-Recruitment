"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  MdArrowBack,
  MdClose,
  MdCompareArrows,
  MdDashboard,
  MdError,
  MdLogout,
  MdMenu,
  MdNotifications,
  MdPeople,
  MdSettings,
  MdWork,
  MdInsights,
} from "react-icons/md";
import { auth } from "@/lib/firebase/client";
import { trpc } from "@/lib/trpc/client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathName = usePathname();
  const jwtDecoded = trpc.auth.decodeJWT.useQuery();

  if (jwtDecoded.isLoading || !jwtDecoded.isSuccess || !jwtDecoded.data) {
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
              {jwtDecoded.data.user.role === "SuperAdmin" && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-3 hover:bg-white/20 px-3 py-2 rounded-md transition ${
                    pathName === "/admin" ? "bg-white/30" : ""
                  }`}
                >
                  <MdDashboard /> Dashboard
                </Link>
              )}

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

              {jwtDecoded.data.user.role === "SuperAdmin" && (
                <Link
                  href="/admin/compare"
                  className={`flex items-center gap-3 hover:bg-white/20 px-3 py-2 rounded-md transition ${
                    pathName === "/admin/compare" ? "bg-white/30" : ""
                  }`}
                >
                  <MdCompareArrows /> Compare
                </Link>
              )}
              {jwtDecoded.data.user.role === "SuperAdmin" && (
                <>
                  <Link
                    href="/admin/bottlenecks"
                    className={`flex items-center gap-3 hover:bg-white/20 px-3 py-2 rounded-md transition ${
                      pathName === "/admin/bottlenecks" ? "bg-white/30" : ""
                    }`}
                  >
                    <MdError /> Bottlenecks
                  </Link>

                  <Link
                    href={{ pathname: "/admin/audit_logs" }}
                    className={`flex items-center gap-3 hover:bg-white/20 px-3 py-2 rounded-md transition ${
                      pathName === "/admin/audit_logs" ? "bg-white/30" : ""
                    }`}
                  >
                    <MdNotifications /> Audit Logs
                  </Link>

                  <Link
                    href={{ pathname: "/admin/kpi_metrics" }}
                    className={`flex items-center gap-3 hover:bg-white/20 px-3 py-2 rounded-md transition ${
                      pathName === "/admin/kpi_metrics" ? "bg-white/30" : ""
                    }`}
                  >
                    <MdInsights /> KPI Metrics
                  </Link>

                  <Link
                    href={"/admin/staffs" as Route}
                    className={`flex items-center gap-3 hover:bg-white/20 px-3 py-2 rounded-md transition ${
                      pathName === "/admin/staffs" ? "bg-white/30" : ""
                    }`}
                  >
                    <MdPeople /> Staffs
                  </Link>

                  <Link
                    href={{ pathname: "/admin/hr_officers" }}
                    className={`flex items-center gap-3 hover:bg-white/20 px-3 py-2 rounded-md transition ${
                      pathName === "/admin/hr_officers" ? "bg-white/30" : ""
                    }`}
                  >
                    <MdPeople /> HR Officers
                  </Link>
                </>
              )}

              <div className="flex gap-4 justify-center">
                <MdSettings className="cursor-pointer hover:text-red-300" />
                <MdLogout
                  onClick={() => {
                    auth.signOut();
                    router.push("/login");
                  }}
                  className="cursor-pointer hover:text-red-300"
                />
              </div>
            </nav>
          </motion.aside>
        )}
        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow p-4 flex justify-between items-center">
            <button
              type="button"
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
            </div>
          </header>

          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </AnimatePresence>
    </div>
  );
}
