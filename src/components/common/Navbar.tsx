"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Bell } from "lucide-react";
import useNotifications from "@/hooks/useNotifications";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import useAuth from "@/hooks/useAuth";

const profileImageUrl = "/default-avatar.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { isAuthenticated } = useAuth({
    routerActivation: false,
    fetchUser: false,
  });

  const jwtInfo = trpc.auth.decodeJWT.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const isAdmin = jwtInfo.data?.user.role !== "User";

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
    <nav className="bg-white text-black shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-lg font-bold">
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
              <button onClick={() => setOpen(!open)} className="relative">
                <Bell className="w-6 h-6 text-gray-600 hover:text-red-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4.5 h-4 bg-red-600 text-white text-xs flex items-center justify-center rounded-full px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              {open && (
                <div className="absolute top-10 right-0 bg-white shadow-lg rounded-lg w-64 p-4 z-10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    {unreadCount > 0 ? (
                      <button
                        className="text-xs text-blue-600 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAllAsRead();
                        }}
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
                        <li
                          key={notification.id}
                          className={`p-2 rounded mb-1 cursor-pointer ${
                            !notification.isRead ? "bg-gray-100" : ""
                          } hover:bg-gray-200`}
                          onClick={() => clickNotification(notification.id)}
                        >
                          <div className="flex justify-between items-center">
                            <span>{notification.body}</span>
                            {!notification.isRead && (
                              <span className="ml-2 w-2.5 h-2.5 bg-red-600 rounded-full inline-block"></span>
                            )}
                          </div>
                          <button
                            className="text-xs text-red-500 mt-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <Link href={isAdmin ? "/admin" : "/profile"}>
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
              href="/login"
              className="bg-[#E30022] text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
            >
              Apply Now
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
