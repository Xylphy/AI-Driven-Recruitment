"use client";

import { MdLocationOn, MdAccessTime, MdChevronRight } from "react-icons/md";
import Image from "next/image";

export default function SystemsAdminPage() {
  return (
    <main className="bg-white min-h-screen py-5 px-4 md:px-20">
      <div className="max-w-4xl mx-auto">
        <div className="relative h-44">
          <Image
            src="/workspace.jpg"
            alt="Header Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/75 z-10" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
            <h1 className="text-3xl font-bold text-center text-white">
              Systems Administrators
            </h1>
            <hr className="w-1/2 mx-auto border-t border-red-600 my-2" />
            <div className="flex justify-center mt-2 space-x-4 text-white font-medium text-sm">
              <span className="flex items-center gap-1">
                <MdLocationOn className="text-red-600" /> Cebu Office
              </span>
              <span className="flex items-center gap-1">
                <MdAccessTime className="text-red-600" /> Full-Time
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row py-5">
          <div className="w-full lg:w-2/3 p-8">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Qualifications
              </h2>
              <ul className="space-y-2 text-gray-700 text-sm">
                {[
                  "Graduate of Computer Science, Information Technology, or related courses.",
                  "With at least 3–4 years' full-time working experience doing Systems Administrator work.",
                  "With experience working with companies with mid-to-complex infrastructure setup.",
                  "With experience managing team members with at least 3–5 headcount in size.",
                  "With strong foundation in IT infrastructure, including OS (Windows, Linux, Unix), server tech (Active Directory, Apache), network protocols (TCP/IP, DNS), virtualization (VMware, Hyper-V), cloud (Microsoft Azure).",
                  "Must possess thorough understanding of hardware, storage systems, and backup solutions.",
                  "Excellent oral and written communication skills.",
                  "Strong time-management skills and ability to work in a fast-paced environment.",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <MdChevronRight className="text-red-600 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Responsibilities
              </h2>
              <ul className="space-y-2 text-gray-700 text-sm">
                {[
                  "System setup/configuration: Install and maintain computer systems, servers, and network equipment.",
                  "Monitoring and maintenance of systems/networks.",
                  "End-user support within the organization.",
                  "Network admin: routers, switches, firewalls, access points.",
                  "Data backup and recovery: implement and manage plans and tools.",
                  "Security and compliance: enforce systems security protocols.",
                  "Upgrades and new tech evaluation: coordinate with vendors and other IT staff.",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <MdChevronRight className="text-red-600 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="w-full lg:w-1/3 bg-gray-50 border-l p-6">
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Job Summary
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  <strong>Published:</strong> April 1, 2025
                </li>
                <li>
                  <strong>Vacancy:</strong> 20 positions
                </li>
                <li>
                  <strong>Job Nature:</strong> Full Time
                </li>
                <li>
                  <strong>Location:</strong> Cebu Office
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Company Detail
              </h3>
              <p className="text-sm text-gray-700">
                Alliance Software, Inc. is a global IT services and solutions
                company. Established in 2000, Alliance has grown to become one
                of the Philippines’ largest and most respected independent
                software development companies.
              </p>
            </section>

            <button className="mt-6 w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700 transition">
              SEE APPLICANTS
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
