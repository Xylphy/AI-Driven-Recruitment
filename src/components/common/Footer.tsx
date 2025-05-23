import React from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { MdEmail, MdPhone } from "react-icons/md";
import Image from "next/image";
import Link from "next/link";

const Header: React.FC = () => {
  return (
    <header className="bg-[url('/footer-bg.png')] bg-cover bg-center text-white py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Alliance Logo" width={50} height={50} />
          </div>
          <div className="text-sm space-y-1 mt-2 md:mt-0">
            <div className="flex items-center gap-2">
              <MdEmail /> <span>alliance@alliance.com</span>
            </div>
            <div className="flex items-center gap-2">
              <FaFacebook /> <span>@alliance</span>
            </div>
            <div className="flex items-center gap-2">
              <FaInstagram /> <span>@allianceinc</span>
            </div>
            <div className="flex items-center gap-2">
              <MdPhone /> <span>+63 912 345 6789</span>
            </div>
          </div>
        </div>

        <nav className="mt-6 md:mt-0">
          <ul className="grid grid-cols-2 gap-2 text-sm font-400 text-left">
            <li>
              <Link href="/" className="mr-2 hover:underline">
                HOME
              </Link>
            </li>
            <li>
              <Link href="/aboutus/" className="hover:underline">
                ABOUT US
              </Link>
            </li>
            <li>
              <Link href="/news/" className="mr-4 hover:underline">
                NEWS AND EVENTS
              </Link>
            </li>
            <li>
              <Link href="/trainings/" className="hover:underline">
                TRAININGS
              </Link>
            </li>
            <li>
              <Link href="/joblistings/" className="mr-2 hover:underline">
                JOB LISTINGS
              </Link>
            </li>
            <li>
              <Link href="/privacypolicy/" className="hover:underline">
                PRIVACY POLICY
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
