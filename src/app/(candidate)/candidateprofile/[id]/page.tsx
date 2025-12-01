"use client";

import { FaFacebook, FaInstagram } from "react-icons/fa";
import { MdEmail, MdPhone } from "react-icons/md";
import Image from "next/image";
import { startTransition, useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "@/lib/trpc/routers/app";

type FetchCandidateProfileOutput = inferProcedureOutput<
  AppRouter["candidate"]["fetchCandidateProfile"]
>;

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

export default function Page() {
  const router = useRouter();
  const candidateId = useParams().id as string; // userId
  const [selectedStatus, setSelectedStatus] = useState("");
  const { isAuthenticated } = useAuth();

  const userJWT = trpc.auth.decodeJWT.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const candidateProfileQuery = trpc.candidate.fetchCandidateProfile.useQuery(
    {
      candidateId: candidateId,
      fetchScore: true,
      fetchTranscribed: true,
      fetchResume: true,
    },
    {
      enabled: isAuthenticated && userJWT.data?.user.isAdmin,
    }
  );
  const updateCandidateStatusMutation =
    trpc.candidate.updateCandidateStatus.useMutation();

  const [onResume, setOnResume] = useState(false);

  useEffect(() => {
    if (userJWT.isLoading || !isAuthenticated) {
      return;
    }

    if (!userJWT.data?.user.isAdmin) {
      alert("You are not authorized to view this page.");
      if (window.history.length > 0) {
        router.back();
      } else {
        router.push("/profile");
      }
    }

    startTransition(() =>
      setSelectedStatus(candidateProfileQuery.data?.status || "")
    );
  }, [userJWT.data]);

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value;
    const oldStatus = selectedStatus;

    setSelectedStatus(newStatus);
    await updateCandidateStatusMutation.mutateAsync(
      {
        applicantId: candidateId,
        newStatus: newStatus,
      },
      {
        onSuccess: () => {
          alert("Candidate status updated successfully.");
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error ? error.message : String(error);
          alert(message);
          setSelectedStatus(oldStatus);
        },
      }
    );
  };

  return (
    <main className="bg-white h-[75vh] overflow-hidden">
      <div className="container mx-auto px-4 h-full">
        <div className="bg-white rounded-lg max-w-6xl mx-auto h-full flex">
          <div className="w-full md:w-1/3 border-r border-gray-300 p-6 flex flex-col items-center bg-white">
            <label
              htmlFor="profile-upload"
              className="relative inline-block w-40 h-40 rounded-full overflow-hidden cursor-pointer group"
            >
              <Image
                src="/logo.png"
                alt="Profile"
                width={160}
                height={160}
                className="object-cover rounded-full w-full h-full"
              />
            </label>

            <h2 className="text-lg font-semibold mt-4 text-center">
              {!candidateProfileQuery.data ? (
                <div className="animate-pulse">
                  <div className="w-24 h-4 bg-gray-300 rounded"></div>
                  <div className="w-16 h-4 bg-gray-300 rounded mt-2"></div>
                </div>
              ) : (
                <span>
                  {candidateProfileQuery.data.user.firstName}{" "}
                  {candidateProfileQuery.data.user.lastName}
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
                onChange={handleStatusChange}
                className="bg-red-600 text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-600 hover:border-red-600 focus:outline-none"
              >
                <option value="">Select Status</option>
                <option value="Initial Interview">Initial Interview</option>
                <option value="For Interview">For Interview</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="flex flex-col gap-4 my-4">
              <button
                onClick={() => setOnResume(!onResume)}
                className="bg-[#E30022] text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
              >
                VIEW CANDIDATE PROFILE
              </button>
            </div>
          </div>
          {onResume ? (
            <CandidateResume candidateProfile={candidateProfileQuery.data} />
          ) : (
            <CandidateProfile candidateProfile={candidateProfileQuery.data} />
          )}
        </div>
      </div>
    </main>
  );
}

function CandidateProfile({
  candidateProfile,
}: {
  candidateProfile: FetchCandidateProfileOutput | null | undefined;
}) {
  return (
    <>
      <div className="w-full md:w-2/3 p-6">
        <h2 className="text-2xl font-bold mb-6">
          <span className="text-red-600">Candidate</span> Evaluation
        </h2>
        <div className="h-[65vh] overflow-y-auto space-y-10 pr-2">
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
                      candidateProfile?.score?.score_data?.predictive_success ??
                      0
                    }%`,
                  }}
                ></div>
              </div>
              <span className="text-xs text-gray-600 mt-1 block">
                {candidateProfile?.score?.score_data.predictive_success || 0}%
                likelihood of success
              </span>
            </div>

            <div className="mt-2">
              <span className="block text-sm font-medium text-gray-700 mb-1">
                Key Highlights:
              </span>
              <ul className="list-disc ml-6 text-sm text-gray-700">
                {candidateProfile?.score?.score_data.phrases.map(
                  (phrase: string, idx: number) => (
                    <li key={idx}>{phrase}</li>
                  )
                )}
              </ul>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700 mb-1">
                Evaluation Summary:
              </span>
              <p className="text-sm text-gray-700 leading-relaxed">
                {candidateProfile?.score?.score_data.reason},
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg shadow-sm space-y-6 text-sm text-gray-800">
            <div>
              <h3 className="font-semibold text-gray-700">
                Sentiment Analysis
              </h3>
              <p>
                {candidateProfile?.transcribed?.transcription
                  ?.sentimental_analysis || "No sentiment analysis available."}
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

            <div>
              <h3 className="font-semibold text-gray-700">
                Cultural Fit Insights
              </h3>
              <p>
                {candidateProfile?.transcribed?.transcription
                  .cultural_fit_insights ||
                  "No cultural fit insights available."}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">
                Skill Gaps Recommendations
              </h3>
              <p>
                {candidateProfile?.score?.score_data
                  .skill_gaps_recommendations ||
                  "No skill gaps recommendations available."}
              </p>
            </div>

            <details className="bg-white border rounded p-3">
              <summary className="cursor-pointer font-medium text-red-600">
                View Full Transcription
              </summary>
              <p className="mt-2 text-gray-700">
                {candidateProfile?.transcribed?.transcription.transcription ||
                  "No transcription available."}
              </p>
            </details>
          </div>
        </div>
      </div>
    </>
  );
}

function CandidateResume({
  candidateProfile,
}: {
  candidateProfile: FetchCandidateProfileOutput | null | undefined;
}) {
  return (
    <div className="w-full md:w-2/3 p-6">
      <h2 className="text-2xl font-bold mb-6">
        <span className="text-red-600">Candidate</span> Profile
      </h2>

      <div className="h-[65vh] overflow-y-auto pr-2 space-y-8 text-sm text-gray-800">
        <div className="space-y-1">
          <p>
            <strong>Name:</strong>{" "}
            {candidateProfile?.parsedResume?.raw_output?.name || "N/A"}
          </p>
          <p>
            <strong>Contact:</strong>{" "}
            {candidateProfile?.parsedResume?.raw_output?.contact_number ||
              "N/A"}
          </p>
          <p>
            <strong>Email:</strong>{" "}
            {candidateProfile?.parsedResume?.raw_output?.email || "N/A"}
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Education
          </h3>
          <div className="bg-white p-4 border rounded">
            {candidateProfile?.parsedResume?.raw_output?.educational_background.map(
              (edu: EducationalBackground, index: number) => (
                <div key={index} className="mb-4">
                  <p>
                    <strong>Degree:</strong> {edu.degree}
                  </p>
                  <p>
                    <strong>Institution:</strong> {edu.institution}
                  </p>
                  <p>
                    <strong>Start:</strong>{" "}
                    {new Date(edu.start_date).getFullYear()}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Soft Skills
          </h3>
          <ul className="list-disc ml-6 space-y-1">
            {candidateProfile?.parsedResume?.raw_output?.soft_skills &&
            candidateProfile.parsedResume?.raw_output?.soft_skills.length > 0
              ? candidateProfile.parsedResume.raw_output.soft_skills.map(
                  (skill: string, index: number) => <li key={index}>{skill}</li>
                )
              : null}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Hard Skills
          </h3>
          <ul className="list-disc ml-6 space-y-1 columns-2">
            {candidateProfile?.parsedResume?.raw_output?.hard_skills &&
            candidateProfile.parsedResume.raw_output.hard_skills.length > 0
              ? candidateProfile.parsedResume.raw_output.hard_skills.map(
                  (skill: string, index: number) => <li key={index}>{skill}</li>
                )
              : null}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Work Experience
          </h3>
          <div className="space-y-4">
            {candidateProfile?.parsedResume?.raw_output?.work_experience.map(
              (work: WorkExperience, index: number) => (
                <div key={index} className="bg-white p-4 border rounded">
                  <p>
                    <strong>Title:</strong> {work.title}
                  </p>
                  <p>
                    <strong>Company:</strong> {work.company}
                  </p>
                  <p>
                    <strong>Start:</strong>{" "}
                    {work.start_date
                      ? new Date(work.start_date).getFullYear()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>End:</strong>{" "}
                    {work.end_date
                      ? new Date(work.end_date).getFullYear()
                      : "Present"}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Projects</h3>
          {candidateProfile?.parsedResume?.raw_output?.projects &&
          candidateProfile.parsedResume?.raw_output.projects?.length > 0 ? (
            candidateProfile.parsedResume?.raw_output.projects.map(
              (project: Project, index: number) => (
                <div key={index} className="bg-white p-4 border rounded">
                  <p>
                    <strong>Name:</strong> {project.name}
                  </p>
                  <p>
                    <strong>Start:</strong>{" "}
                    {new Date(project.start_date).getFullYear()}
                  </p>
                  <p>
                    <strong>Description:</strong> {project.description}
                  </p>
                </div>
              )
            )
          ) : (
            <p>No projects listed.</p>
          )}
        </div>
      </div>
    </div>
  );
}
