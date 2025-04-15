import React from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { MdEmail, MdPhone } from "react-icons/md";

const Header: React.FC = () => {
  return (
    <header className="bg-[url('/footer-bg.png')] bg-cover bg-center text-white py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo-white.png" alt="Alliance Logo" className="w-50" />
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
              <a href="/" className="mr-2 hover:underline">
                HOME
              </a>
            </li>
            <li>
              <a href="/aboutus/" className="hover:underline">
                ABOUT US
              </a>
            </li>
            <li>
              <a href="/news/" className="mr-4 hover:underline">
                NEWS AND EVENTS
              </a>
            </li>
            <li>
              <a href="/trainings/" className="hover:underline">
                TRAININGS
              </a>
            </li>
            <li>
              <a href="/joblistings/" className="mr-2 hover:underline">
                JOB LISTINGS
              </a>
            </li>
            <li>
              <a href="/privacypolicy/" className="hover:underline">
                PRIVACY POLICY
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
