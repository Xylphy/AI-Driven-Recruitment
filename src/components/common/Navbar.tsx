"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  MdClose,
  MdCompareArrows,
  MdDashboard,
  MdError,
  MdInsights,
  MdMenu,
  MdNotifications,
  MdPeople,
  MdPsychology,
  MdSettings,
  MdWork,
} from "react-icons/md";

import useAuth from "@/hooks/useAuth";
import useNotifications from "@/hooks/useNotifications";
import { getAuthInstance } from "@/lib/firebase/client";
import { trpc } from "@/lib/trpc/client";

const profileImageUrl = "/default-avatar.png";

const profileLink = {
  Admin: "/admin",
  SuperAdmin: "/admin",
  Staff: "/admin/jobs",
} as const;

type Role = keyof typeof profileLink;

export default function Navbar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const router = useRouter();
  const pathName = usePathname();

  const { isAuthenticated } = useAuth({ routerActivation: false });

  const jwtInfo = trpc.auth.decodeJWT.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const role = jwtInfo.data?.user.role as Role | undefined;

  const isAdminUser = useMemo(() => {
    return role === "Admin" || role === "SuperAdmin" || role === "Staff";
  }, [role]);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(undefined, jwtInfo.data?.user.id);

  const clickNotification = (notificationId: string) => {
    markAsRead(notificationId);
    const link =
      notifications.find((n) => n.id === notificationId)?.link ?? "/";
    router.push(link as unknown as Parameters<typeof router.push>[0]);
    setNotifOpen(false);
  };

  const onNotificationKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    notificationId: string,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      clickNotification(notificationId);
    }
  };

  return (
    <>
      <nav className="bg-white text-black shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {isAuthenticated && isAdminUser && (
              <button
                type="button"
                onClick={() => setAdminOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                aria-label="Toggle admin menu"
              >
                <MdMenu className="text-xl text-gray-700" />
              </button>
            )}

            <Link href={"/"}>
              <Image
                src="/logo.png"
                alt="Alliance Logo"
                width={130}
                height={50}
              />
            </Link>
          </div>

          <div className="flex items-center gap-4 relative">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative"
                  type="button"
                >
                  <Bell className="w-6 h-6 text-gray-600 hover:text-red-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4.5 h-4 bg-red-600 text-white text-xs flex items-center justify-center rounded-full px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute top-10 right-0 bg-white shadow-lg rounded-lg w-72 p-4 z-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold">Notifications</h3>
                      {unreadCount > 0 ? (
                        <button
                          className="text-xs text-blue-600 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAllAsRead();
                          }}
                          type="button"
                        >
                          Mark all as read
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">All read</span>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <p className="text-sm text-gray-500">No notifications</p>
                    ) : (
                      <ul className="max-h-60 overflow-y-auto">
                        {notifications.map((notification) => (
                          <li key={notification.id} className="mb-1">
                            <button
                              type="button"
                              className={`w-full text-left p-2 rounded cursor-pointer ${
                                !notification.isRead ? "bg-gray-100" : ""
                              } hover:bg-gray-200`}
                              onClick={() => clickNotification(notification.id)}
                              onKeyDown={(e) =>
                                onNotificationKeyDown(e, notification.id)
                              }
                            >
                              <div className="flex justify-between items-center">
                                <span>{notification.body}</span>
                                {!notification.isRead && (
                                  <span className="ml-2 w-2.5 h-2.5 bg-red-600 rounded-full inline-block"></span>
                                )}
                              </div>
                            </button>

                            <button
                              className="text-xs text-red-500 mt-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              type="button"
                            >
                              Delete
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <Link href={role ? profileLink[role] : "/login"}>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-500 hover:border-black transition-all duration-300">
                    <Image
                      src={profileImageUrl}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                </Link>
              </>
            ) : (
              <Link
                href={"/track" as Route}
                className="bg-linear-to-r from-red-600 to-rose-500 text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:scale-[1.01] hover:opacity-90"
              >
                Track Application
              </Link>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isAuthenticated && isAdminUser && adminOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close admin menu backdrop"
              className="fixed inset-0 bg-black/30 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAdminOpen(false)}
            />

            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="
                fixed top-0 left-0 z-50
                w-72 h-screen
                backdrop-blur-2xl bg-white/80
                border-r border-white/30
                shadow-[0_20px_60px_rgba(227,0,34,0.15)]
                text-gray-800
                flex flex-col
                p-6
                overflow-y-auto
              "
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold bg-linear-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                  Admin Panel
                </h2>
                <button
                  type="button"
                  onClick={() => setAdminOpen(false)}
                  aria-label="Close admin menu"
                >
                  <MdClose className="text-2xl text-gray-600 hover:text-red-600 transition" />
                </button>
              </div>

              <nav className="flex flex-col gap-3 flex-1">
                {role === "SuperAdmin" && (
                  <Link
                    href="/admin"
                    onClick={() => setAdminOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      pathName === "/admin"
                        ? "bg-linear-to-r from-red-600 to-red-500 text-white shadow-lg"
                        : "hover:bg-white/60"
                    }`}
                  >
                    <MdDashboard /> Dashboard
                  </Link>
                )}

                <Link
                  href="/admin/jobs"
                  onClick={() => setAdminOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    pathName === "/admin/jobs"
                      ? "bg-linear-to-r from-red-600 to-red-500 text-white shadow-lg"
                      : "hover:bg-white/60"
                  }`}
                >
                  <MdWork /> Jobs
                </Link>

                <Link
                  href="/admin/applicants"
                  onClick={() => setAdminOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    pathName === "/admin/applicants"
                      ? "bg-linear-to-r from-red-600 to-red-500 text-white shadow-lg"
                      : "hover:bg-white/60"
                  }`}
                >
                  <MdPeople /> Candidates
                </Link>

                <Link
                  href="/admin/compare"
                  onClick={() => setAdminOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    pathName === "/admin/compare"
                      ? "bg-linear-to-r from-red-600 to-red-500 text-white shadow-lg"
                      : "hover:bg-white/60"
                  }`}
                >
                  <MdCompareArrows /> Compare
                </Link>

                <Link
                  href="/admin/ai_metrics"
                  onClick={() => setAdminOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    pathName === "/admin/ai_metrics"
                      ? "bg-linear-to-r from-red-600 to-red-500 text-white shadow-lg"
                      : "hover:bg-white/60"
                  }`}
                >
                  <MdPsychology /> AI Metrics
                </Link>

                {role === "SuperAdmin" && (
                  <>
                    <Link
                      href="/admin/bottlenecks"
                      onClick={() => setAdminOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        pathName === "/admin/bottlenecks"
                          ? "bg-linear-to-r from-red-600 to-red-500 text-white shadow-lg"
                          : "hover:bg-white/60"
                      }`}
                    >
                      <MdError /> Bottlenecks
                    </Link>

                    <Link
                      href="/admin/audit_logs"
                      onClick={() => setAdminOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        pathName === "/admin/audit_logs"
                          ? "bg-linear-to-r from-red-600 to-red-500 text-white shadow-lg"
                          : "hover:bg-white/60"
                      }`}
                    >
                      <MdNotifications /> Audit Logs
                    </Link>

                    <Link
                      href="/admin/kpi_metrics"
                      onClick={() => setAdminOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        pathName === "/admin/kpi_metrics"
                          ? "bg-linear-to-r from-red-600 to-red-500 text-white shadow-lg"
                          : "hover:bg-white/60"
                      }`}
                    >
                      <MdInsights /> KPI Metrics
                    </Link>

                    <Link
                      href="/admin/staffs"
                      onClick={() => setAdminOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        pathName === "/admin/staffs"
                          ? "bg-linear-to-r from-red-600 to-red-500 text-white shadow-lg"
                          : "hover:bg-white/60"
                      }`}
                    >
                      <MdPeople /> Staffs
                    </Link>

                    <Link
                      href="/admin/hr_officers"
                      onClick={() => setAdminOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        pathName === "/admin/hr_officers"
                          ? "bg-linear-to-r from-red-600 to-red-500 text-white shadow-lg"
                          : "hover:bg-white/60"
                      }`}
                    >
                      <MdPeople /> Staffs
                    </Link>
                  </>
                )}

                <div className="mt-auto pt-6 border-t border-white/30 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminOpen(false);
                      router.push("/update-password");
                    }}
                    aria-label="Admin settings"
                  >
                    <MdSettings className="text-xl text-gray-600 hover:text-red-600 cursor-pointer transition" />
                  </button>

                  <button
                    type="button"
                    onClick={() => getAuthInstance().signOut()}
                    aria-label="Logout"
                  >
                    <MdNotifications className="hidden" />
                  </button>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
