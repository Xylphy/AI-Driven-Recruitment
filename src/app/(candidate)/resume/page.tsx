"use client";

import { FaFacebook, FaInstagram } from "react-icons/fa";
import {
  MdEmail,
  MdPhone,
  MdNotifications,
  MdSettings,
  MdLogout,
} from "react-icons/md";
import JobApplicationDetails from "@/components/profile/JobApplications";
import Image from "next/image";
import { useEffect, useState } from "react";
import { JobListing } from "@/types/schema";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";

export default function Profile() {
  const router = useRouter();

  const [jobListed, setJobListed] = useState<{
    createdByThem: JobListing[];
    createdByOthers: JobListing[];
  }>({
    createdByThem: [],
    createdByOthers: [],
  });

  const { information, isAuthLoading } = useAuth(true, true);
  const [isJobLoading, setIsJobLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    const fetchContent = async () => {
      fetch("/api/joblisting", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) {
            alert("Failed to fetch job listings");
            return null;
          }
          return res.json();
        })
        .then((body) => {
          if (!body) {
            return;
          }
          if (information) {
            const formatJobDate = (
              job: Pick<JobListing, "title" | "created_at">
            ) => ({
              ...job,
              created_at: new Date(job.created_at).toLocaleDateString(),
            });

            setJobListed({
              createdByThem: body.data.createdByThem.map(formatJobDate),
              createdByOthers: body.data.createdByAll.map(formatJobDate),
            });
          }
        })
        .finally(() => {
          setIsJobLoading(false);
        });
    };

    fetchContent();
  }, [isAuthLoading]);

  return (
    <main className="bg-white h-[75vh] overflow-hidden">
      <div className="container mx-auto px-4 h-full">
        <div className="bg-white rounded-lg max-w-6xl mx-auto h-full flex">
          <div className="w-full md:w-1/3 border-r border-gray-300 p-6 flex flex-col items-center bg-white">
            <label
              htmlFor="profile-upload"
              className="relative inline-block w-40 h-40 rounded-full overflow-hidden cursor-pointer group"
            >
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                className="hidden"
              />
              <Image
                src="/logo.png"
                alt="Profile"
                width={160}
                height={160}
                className="object-cover rounded-full w-full h-full"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-50 transition-opacity duration-200">
                <span className="text-white font-medium">Update Picture</span>
              </div>
            </label>

            <h2 className="text-lg font-semibold mt-4 text-center">
              {isAuthLoading ? (
                <div className="animate-pulse">
                  <div className="w-24 h-4 bg-gray-300 rounded"></div>
                  <div className="w-16 h-4 bg-gray-300 rounded mt-2"></div>
                </div>
              ) : (
                <span>
                  {information.user?.first_name || "No"}{" "}
                  {information.user?.last_name || "Name"}
                </span>
              )}
            </h2>

            <div className="flex gap-3 my-4">
              <MdEmail className="text-red-600" />
              <FaFacebook className="text-red-600" />
              <FaInstagram className="text-red-600" />
              <MdPhone className="text-red-600" />
            </div>
            {information.admin && (
              <div className="mt-4">
                <label
                  htmlFor="status"
                  className="block text-sm text-center font-semibold text-gray-700 mb-1"
                >
                  Candidate Status
                </label>
                <select
                  id="status"
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    console.log("Selected status:", newStatus);
                  }}
                  className="bg-red-600 text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-600 hover:border-red-600 focus:outline-none"
                >
                  <option disabled selected>
                    Select Status
                  </option>
                  <option value="initial">Initial Interview</option>
                  <option value="for-interview">For Interview</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}

            <div className="flex flex-col gap-4 my-4">
              <button
                onClick={() => router.push("/candidateprofile")}
                className="bg-[#E30022] text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
              >
                VIEW CANDIDATE SCORE
              </button>
            </div>
          </div>
          <div className="w-full md:w-2/3 p-6">
            <h2 className="text-2xl font-bold mb-6">
              <span className="text-red-600">Candidate</span> Profile
            </h2>

            <div className="h-[65vh] overflow-y-auto pr-2 space-y-8 text-sm text-gray-800">
              <div className="space-y-1">
                <p>
                  <strong>Name:</strong> JAMES KENNETH S. ACABAL
                </p>
                <p>
                  <strong>Contact:</strong> +639270183421
                </p>
                <p>
                  <strong>Email:</strong> jameskennethacabal@gmail.com
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Education
                </h3>
                <div className="bg-white p-4 border rounded">
                  <p>
                    <strong>Degree:</strong> Bachelor of Science in Computer
                    Science
                  </p>
                  <p>
                    <strong>Institution:</strong> Cebu Institute of Technology –
                    University
                  </p>
                  <p>
                    <strong>Start:</strong> 2022
                  </p>
                  <p>
                    <strong>End:</strong> 2026
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Soft Skills
                </h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Continuous Learning</li>
                  <li>Leadership</li>
                  <li>Collaboration</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Hard Skills
                </h3>
                <ul className="list-disc ml-6 space-y-1 columns-2">
                  <li>Back-end Development</li>
                  <li>Machine/Deep Learning</li>
                  <li>Performance Optimization</li>
                  <li>C#</li>
                  <li>Python</li>
                  <li>Django Framework</li>
                  <li>ASP .NET CORE WEB API</li>
                  <li>HTML, CSS, Tailwind</li>
                  <li>JavaScript</li>
                  <li>JQuery</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Work Experience
                </h3>
                <div className="space-y-4">
                  <div className="bg-white p-4 border rounded">
                    <p>
                      <strong>Title:</strong> Back-end Developer
                    </p>
                    <p>
                      <strong>Company:</strong> IntelliForums – Advanced Forums
                      System
                    </p>
                    <p>
                      <strong>Start:</strong> 2024
                    </p>
                    <p>
                      <strong>Description:</strong> Developed a full-stack
                      online forum system using Python – Django Framework.
                      Implemented authentication, real-time database updates,
                      and seamless UI. Designed & optimized schema for artwork
                      listings & transactions.
                    </p>
                  </div>
                  <div className="bg-white p-4 border rounded">
                    <p>
                      <strong>Title:</strong> Back-end Developer
                    </p>
                    <p>
                      <strong>Company:</strong> AINI – Agricultural Networks and
                      Innovation
                    </p>
                    <p>
                      <strong>Start:</strong> 2024
                    </p>
                    <p>
                      <strong>Description:</strong> Collaborated on a web
                      application for agricultural networking. Used C#, ASP.NET
                      CORE WEB API, Tailwind, and JavaScript for responsive
                      frontend & user-friendly UI. Implemented frontend using
                      Tailwind + JQuery.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Projects
                </h3>
                <div className="bg-white p-4 border rounded">
                  <p>
                    <strong>Name:</strong> Interpreter Developer – Bisaya++
                  </p>
                  <p>
                    <strong>Start:</strong> 2024
                  </p>
                  <p>
                    <strong>End:</strong> 2025
                  </p>
                  <p>
                    <strong>Description:</strong> Designed and developed
                    Bisaya++, a high-level interpreted language for teaching
                    native Cebuanos programming. Built in C++ with user-friendly
                    syntax to lower the learning curve. Emphasized robust,
                    scalable design.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
