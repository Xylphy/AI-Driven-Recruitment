"use client";

import { FaFacebook, FaInstagram } from "react-icons/fa";
import { MdEmail, MdPhone } from "react-icons/md";
import Image from "next/image";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: candidateId } = use(params);
  const [selectedStatus, setSelectedStatus] = useState("");
  const { information, isAuthLoading } = useAuth(true, true);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    fetch("/api/users/candidateProfile?userId=" + candidateId, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then();

  }, [candidateId, isAuthLoading]);

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
                  {/* {information.user?.first_name || "No"}{" "}
                  {information.user?.last_name || "Name"} */}
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
                  value={selectedStatus}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    setSelectedStatus(newStatus);
                    sessionStorage.setItem("candidateStatus", newStatus);
                  }}
                  className="bg-red-600 text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-600 hover:border-red-600 focus:outline-none"
                >
                  <option value="">Select Status</option>
                  <option value="initial">Initial Interview</option>
                  <option value="for-interview">For Interview</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}

            <div className="flex flex-col gap-4 my-4">
              <button
                onClick={() => router.push("/resume")}
                className="bg-[#E30022] text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
              >
                VIEW CANDIDATE PROFILE
              </button>
            </div>
          </div>
          <div className="w-full md:w-2/3 p-6">
            <h2 className="text-2xl font-bold mb-6">
              <span className="text-red-600">Candidate</span> Evaluation
            </h2>

            {/* SCROLLABLE CONTAINER */}
            <div className="h-[65vh] overflow-y-auto space-y-10 pr-2">
              {/* FIRST EVALUATION BLOCK */}
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg shadow-sm space-y-6">
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-1">
                    Raw Score:
                  </span>
                  <div className="flex items-center space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(3.75)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.184 3.642a1 1 0 00.95.69h3.813c.969 0 1.371 1.24.588 1.81l-3.087 2.243a1 1 0 00-.364 1.118l1.184 3.642c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.087 2.243c-.785.57-1.84-.197-1.54-1.118l1.184-3.642a1 1 0 00-.364-1.118L3.106 9.07c-.783-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.184-3.642z" />
                      </svg>
                    ))}
                    <span className="text-sm text-gray-600">(3.75/5)</span>
                  </div>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-1">
                    Predictive Success:
                  </span>
                  <div className="w-full bg-gray-200 h-3 rounded">
                    <div
                      className="bg-green-500 h-3 rounded"
                      style={{ width: "68%" }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 mt-1 block">
                    68% likelihood of success
                  </span>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-1">
                    Evaluation Summary:
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Candidate scores moderately well based on the provided
                    information...
                  </p>
                </div>
              </div>

              {/* SECOND EVALUATION BLOCK */}
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg shadow-sm space-y-6 text-sm text-gray-800">
                <div>
                  <h3 className="font-semibold text-gray-700">
                    Sentiment Analysis
                  </h3>
                  <p>
                    The overall sentiment expressed in Zing and Glue's
                    introduction is highly positive...
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700">
                    Personality Traits
                  </h3>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>
                      <strong>Openness:</strong> High...
                    </li>
                    <li>
                      <strong>Conscientiousness:</strong> Strong...
                    </li>
                    <li>
                      <strong>Extroversion:</strong> Moderate...
                    </li>
                    <li>
                      <strong>Agreeableness:</strong> High...
                    </li>
                    <li>
                      <strong>Neuroticism:</strong> Low...
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700">
                    Communication Style
                  </h3>
                  <p>Zing and Glue demonstrate an assertive style...</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700">
                    Interview Insights
                  </h3>
                  <p>The intro highlights a proven track record...</p>
                </div>

                <details className="bg-white border rounded p-3">
                  <summary className="cursor-pointer font-medium text-red-600">
                    View Full Transcription
                  </summary>
                  <p className="mt-2 text-gray-700">
                    `&quot`Hi everyone, my name is Zing and Glue and I`&apos`m a
                    26-year-old American...`&quot`
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
