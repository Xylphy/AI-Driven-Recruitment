import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { MdEmail, MdPhone } from "react-icons/md";

const Header: React.FC = () => {
  return (
    <header className="relative w-full bg-white">
      {/* Red gradient overlay glow */}
      <div className="absolute inset-0 bg-linear-to-r from-red-600/10 via-rose-500/10 to-red-700/10 pointer-events-none" />

      <div className="relative backdrop-blur-xl bg-white/70 border-b border-white/40 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Left Section */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/60 backdrop-blur border border-white/40 shadow-sm">
                <Image
                  src="/logo.png"
                  alt="Alliance Logo"
                  width={42}
                  height={42}
                />
              </div>
              <span className="font-bold text-lg text-gray-800 tracking-wide">
                Alliance Inc.
              </span>
            </div>

            {/* Contact Info */}
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center gap-2 hover:text-red-600 transition">
                <MdEmail className="text-red-600" />
                <span>alliance@alliance.com</span>
              </div>

              <div className="flex items-center gap-2 hover:text-red-600 transition cursor-pointer">
                <FaFacebook className="text-red-600" />
                <span>@alliance</span>
              </div>

              <div className="flex items-center gap-2 hover:text-red-600 transition cursor-pointer">
                <FaInstagram className="text-red-600" />
                <span>@allianceinc</span>
              </div>

              <div className="flex items-center gap-2 hover:text-red-600 transition">
                <MdPhone className="text-red-600" />
                <span>+63 912 345 6789</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav>
            <ul className="flex gap-6 text-sm font-semibold tracking-wide text-gray-700">
              <li>
                <Link
                  href="/"
                  className="relative hover:text-red-600 transition group"
                >
                  HOME
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full" />
                </Link>
              </li>

              <li>
                <Link
                  href="/aboutus"
                  className="relative hover:text-red-600 transition group"
                >
                  ABOUT US
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full" />
                </Link>
              </li>

              <li>
                <Link
                  href="/contactus"
                  className="relative hover:text-red-600 transition group"
                >
                  CONTACT US
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full" />
                </Link>
              </li>

              <li>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl bg-linear-to-r from-red-600 to-rose-500 text-white shadow-md hover:opacity-90 transition"
                >
                  ALLIANCE
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
