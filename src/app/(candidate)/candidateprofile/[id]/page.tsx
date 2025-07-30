"use client";

import { FaFacebook, FaInstagram } from "react-icons/fa";
import { MdEmail, MdPhone } from "react-icons/md";
import Image from "next/image";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { use } from "react";

interface WorkExperience {
  company: string;
  start_date?: Date;
  title: string;
  end_date?: Date;
}

interface EducationalBackground {
  degree: string;
  institution: string;
  start_date: Date;
}

interface Project {
  description: string;
  name: string;
  start_date: Date;
}

interface Resume {
  city: string;
  contact_number: string;
  educational_background: EducationalBackground[];
  email: string;
  hard_skills: string[];
  name: string;
  projects: Project[];
  soft_skills: string[];
  work_experience: WorkExperience[];
}

interface ScoreData {
  predictive_success: number;
  raw_score: number;
  reason: string;
}

interface Score {
  score_data: ScoreData;
}

interface TranscriptionInfo {
  transcription: string;
  communication_style_insights: string;
  interview_insights: string;
  personality_traits: string;
  sentimental_analysis: string;
}

interface Transcription {
  transcription: TranscriptionInfo;
}

interface CandidateProfile {
  resume: Resume | null;
  score: Score | null;
  transcribed: Transcription | null;
  firstName: string;
  lastName: string;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: candidateId } = use(params); // userId
  const [selectedStatus, setSelectedStatus] = useState("");
  const { information, isAuthLoading } = useAuth(true, true);
  const [candidateProfile, setCandidateProfile] =
    useState<CandidateProfile | null>(null);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!information.admin) {
      alert("You are not authorized to view this page.");
      if (window.history.length > 0) {
        router.back();
      } else {
        router.push("/profile");
      }
    }

    const candidateAPI = new URL(
      "/api/users/candidateProfile",
      window.location.origin
    );

    candidateAPI.searchParams.set("userId", candidateId);
    candidateAPI.searchParams.set("score", "true");
    candidateAPI.searchParams.set("transcribed", "true");
    candidateAPI.searchParams.set("resume", "true");

    fetch(candidateAPI.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Failed to fetch candidate profile");
        }
      })
      .then((data) => {
        setCandidateProfile({
          resume: data.parsedResume,
          score: data.score,
          transcribed: data.transcribed,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
        });
      });
  }, [candidateId, isAuthLoading]);

  console.log("Candidate Profile Data:", candidateProfile);

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
                  {candidateProfile?.firstName} {candidateProfile?.lastName}
                </span>
              )}
            </h2>

            <div className="flex gap-3 my-4">
              <MdEmail className="text-red-600" />
              <FaFacebook className="text-red-600" />
              <FaInstagram className="text-red-600" />
              <MdPhone className="text-red-600" />
            </div>
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
                          i <
                          Math.floor(
                            candidateProfile?.score?.score_data.raw_score || 0
                          )
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.184 3.642a1 1 0 00.95.69h3.813c.969 0 1.371 1.24.588 1.81l-3.087 2.243a1 1 0 00-.364 1.118l1.184 3.642c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.087 2.243c-.785.57-1.84-.197-1.54-1.118l1.184-3.642a1 1 0 00-.364-1.118L3.106 9.07c-.783-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.184-3.642z" />
                      </svg>
                    ))}
                    <span className="text-sm text-gray-600">
                      ({candidateProfile?.score?.score_data?.raw_score || 0}/5)
                    </span>
                  </div>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-1">
                    Predictive Success:
                  </span>
                  <div className="w-full bg-gray-200 h-3 rounded">
                    <div
                      className="bg-green-500 h-3 rounded"
                      style={{
                        width: `${
                          candidateProfile?.score?.score_data
                            ?.predictive_success ?? 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 mt-1 block">
                    {candidateProfile?.score?.score_data.predictive_success ||
                      0}
                    % likelihood of success
                  </span>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-1">
                    Evaluation Summary:
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {candidateProfile?.score?.score_data.reason ||
                      "No insights available."}
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
                    {candidateProfile?.transcribed?.transcription
                      ?.sentimental_analysis ||
                      "No sentiment analysis available."}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">
                    Communication Style
                  </h3>
                  <p>
                    {candidateProfile?.transcribed?.transcription
                      .communication_style_insights ||
                      "No communication style insights available."}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700">
                    Interview Insights
                  </h3>
                  <p>
                    {candidateProfile?.transcribed?.transcription
                      .interview_insights || "No interview insights available."}
                  </p>
                </div>

                <details className="bg-white border rounded p-3">
                  <summary className="cursor-pointer font-medium text-red-600">
                    View Full Transcription
                  </summary>
                  <p className="mt-2 text-gray-700">
                    {candidateProfile?.transcribed?.transcription
                      .transcription || "No transcription available."}
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
