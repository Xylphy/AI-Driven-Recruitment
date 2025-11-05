"use client";

import { useState } from "react";
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
} from "react-icons/md";
import { trpc } from "@/lib/trpc/client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathName = usePathname();
  const jwtDecoded = trpc.auth.decodeJWT.useQuery();

  if (
    jwtDecoded.isLoading ||
    !jwtDecoded.isSuccess ||
    !jwtDecoded.data.user.isAdmin
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
            className="w-64 bg-[#E30022] text-white flex flex-col p-6"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">Admin Panel</h2>
              <MdClose
                className="cursor-pointer text-2xl"
                onClick={() => setIsSidebarOpen(false)}
              />
            </div>

            <nav className="flex flex-col gap-4">
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
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-2 text-[#E30022] font-bold"
          >
            <MdMenu className="text-2xl" />
            {isSidebarOpen ? "Hide Menu" : "Show Menu"}
          </button>
          <h1 className="text-lg font-semibold text-gray-700">
            Admin Dashboard
          </h1>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
