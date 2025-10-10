"use client";

import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/firebase/client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

const profileImageUrl = "/default-avatar.png";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <nav className="bg-white text-black shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-lg font-bold">
          <Image src="/logo.png" alt="Alliance Logo" width={130} height={50} />
        </div>

        <ul className="flex-1 flex justify-center space-x-6">
          <Link href="/">
            <li className="relative inline-block pb-1 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-red-500 after:transition-all after:duration-300 hover:after:w-full hover:after:left-0 transform after:-translate-x-1/2 hover:after:translate-x-0">
              Home
            </li>
          </Link>
          <Link href="/aboutus">
            <li className="relative inline-block pb-1 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-red-500 after:transition-all after:duration-300 hover:after:w-full hover:after:left-0 transform after:-translate-x-1/2 hover:after:translate-x-0">
              About Us
            </li>
          </Link>
          <Link href="/jobs">
            <li className="relative inline-block pb-1 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-red-500 after:transition-all after:duration-300 hover:after:w-full hover:after:left-0 transform after:-translate-x-1/2 hover:after:translate-x-0">
              Jobs
            </li>
          </Link>
          <Link href="/contactus">
            <li className="relative inline-block pb-1 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-red-500 after:transition-all after:duration-300 hover:after:w-full hover:after:left-0 transform after:-translate-x-1/2 hover:after:translate-x-0">
              Contact Us
            </li>
          </Link>
        </ul>
        <div className="flex items-center gap-4 relative">
          <button onClick={() => setOpen(!open)} className="relative">
            <Bell className="w-6 h-6 text-gray-600 hover:text-red-600" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full"></span>
          </button>
          {open && (
            <div className="absolute top-10 right-0 bg-white shadow-lg rounded-lg w-64 p-4 z-10">
              <h3 className="text-sm font-semibold mb-2">Notifications</h3>
              <ul className="text-sm space-y-2">
                <li className="hover:bg-gray-100 p-2 rounded">
                  New candidate applied to “Software Engineer”
                </li>
                <li className="hover:bg-gray-100 p-2 rounded">
                  Job “Frontend Dev” closed automatically
                </li>
              </ul>
            </div>
          )}
          {isAuthenticated ? (
            <Link href="/profile">
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
