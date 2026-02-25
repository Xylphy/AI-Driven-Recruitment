"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  MdArrowBack,
  MdClose,
  MdCompareArrows,
  MdDashboard,
  MdError,
  MdInsights,
  MdLogout,
  MdMenu,
  MdNotifications,
  MdPeople,
  MdPsychology,
  MdSettings,
  MdWork,
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
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-100">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="
          w-72
          backdrop-blur-2xl
          bg-white/20
          border-r border-white/30
          shadow-[0_20px_60px_rgba(227,0,34,0.15)]
          text-gray-800
          flex flex-col
          p-6
          h-screen
          sticky top-0
          overflow-y-auto
        "
          >
            {/* Sidebar Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-red-300/10 pointer-events-none" />

            <div className="relative flex justify-between items-center mb-10">
              <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                Admin Panel
              </h2>
              <MdClose
                className="cursor-pointer text-2xl text-gray-600 hover:text-red-600 transition"
                onClick={() => setIsSidebarOpen(false)}
              />
            </div>

            <nav className="relative flex flex-col gap-3 flex-1">
              {jwtDecoded.data.user.role === "SuperAdmin" && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    pathName === "/admin"
                      ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg"
                      : "hover:bg-white/40 backdrop-blur-md"
                  }`}
                >
                  <MdDashboard /> Dashboard
                </Link>
              )}

              <Link
                href="/admin/jobs"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  pathName === "/admin/jobs"
                    ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg"
                    : "hover:bg-white/40 backdrop-blur-md"
                }`}
              >
                <MdWork /> Jobs
              </Link>

              <Link
                href="/admin/applicants"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  pathName === "/admin/applicants"
                    ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg"
                    : "hover:bg-white/40 backdrop-blur-md"
                }`}
              >
                <MdPeople /> Candidates
              </Link>

              {jwtDecoded.data.user.role === "SuperAdmin" && (
                <>
                  <Link
                    href="/admin/compare"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      pathName === "/admin/compare"
                        ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg"
                        : "hover:bg-white/40 backdrop-blur-md"
                    }`}
                  >
                    <MdCompareArrows /> Compare
                  </Link>

                  <Link
                    href="/admin/bottlenecks"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      pathName === "/admin/bottlenecks"
                        ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg"
                        : "hover:bg-white/40 backdrop-blur-md"
                    }`}
                  >
                    <MdError /> Bottlenecks
                  </Link>

                  <Link
                    href="/admin/audit_logs"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      pathName === "/admin/audit_logs"
                        ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg"
                        : "hover:bg-white/40 backdrop-blur-md"
                    }`}
                  >
                    <MdNotifications /> Audit Logs
                  </Link>

                  <Link
                    href="/admin/kpi_metrics"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      pathName === "/admin/kpi_metrics"
                        ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg"
                        : "hover:bg-white/40 backdrop-blur-md"
                    }`}
                  >
                    <MdInsights /> KPI Metrics
                  </Link>

                  <Link
                    href="/admin/ai_metrics"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      pathName === "/admin/ai_metrics"
                        ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg"
                        : "hover:bg-white/40 backdrop-blur-md"
                    }`}
                  >
                    <MdPsychology /> AI Metrics
                  </Link>

                  <Link
                    href="/admin/staffs"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      pathName === "/admin/staffs"
                        ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg"
                        : "hover:bg-white/40 backdrop-blur-md"
                    }`}
                  >
                    <MdPeople /> Staffs
                  </Link>

                  <Link
                    href="/admin/hr_officers"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      pathName === "/admin/hr_officers"
                        ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg"
                        : "hover:bg-white/40 backdrop-blur-md"
                    }`}
                  >
                    <MdPeople /> HR Officers
                  </Link>
                </>
              )}

              <div className="mt-auto pt-6 border-t border-white/30 gap-2 flex justify-end">
                <MdSettings
                  onClick={() => router.push("/update-password")}
                  className="text-xl text-gray-600 hover:text-red-600 cursor-pointer transition"
                />
                <MdLogout
                  onClick={() => {
                    auth.signOut();
                    router.push("/login");
                  }}
                  className="text-xl text-gray-600 hover:text-red-600 cursor-pointer transition"
                />
              </div>
            </nav>
          </motion.aside>
        )}

        <div className="flex-1 flex flex-col">
          <header
            className="
      relative
      backdrop-blur-2xl
      bg-white/60
      border-b border-white/40
      shadow-[0_8px_30px_rgba(0,0,0,0.05)]
      px-6 py-4
      flex justify-between items-center
    "
          >
            {/* Soft red glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-400/5 pointer-events-none" />

            {/* Left Section */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="
        relative
        flex items-center gap-2
        px-4 py-2
        rounded-xl
        bg-white/50 backdrop-blur-md
        border border-white/40
        text-red-600 font-semibold
        shadow-sm
        hover:shadow-md
        hover:bg-red-50
        transition-all duration-300
      "
            >
              {!isSidebarOpen && (
                <>
                  <MdMenu className="text-xl" />
                  <span>Menu</span>
                </>
              )}
            </button>

            {/* Right Section */}
            <div className="relative flex items-center gap-5">
              <Link
                href="/"
                className="
          flex items-center gap-2
          px-4 py-2
          rounded-xl
          bg-white/50 backdrop-blur-md
          border border-white/40
          text-gray-600
          hover:text-red-600
          hover:bg-red-50
          transition-all duration-300
        "
              >
                <MdArrowBack className="text-lg" />
                <span className="font-medium">Visit Site</span>
              </Link>

              <div
                className="
                  p-2.5
                  rounded-xl
                  bg-white/50 backdrop-blur-md
                  border border-white/40
                  shadow-sm
                  hover:bg-red-50
                  hover:text-red-600
                  transition-all duration-300
                  cursor-pointer
                "
              >
                <Bell className="w-5 h-5 text-gray-600 hover:text-red-600 transition" />
              </div>
            </div>
          </header>

          <main
            className="
              flex-1
              p-8
              overflow-y-auto
              bg-gradient-to-br from-white/40 via-white/20 to-red-50/30
            "
          >
            {children}
          </main>
        </div>
      </AnimatePresence>
    </div>
  );
}
