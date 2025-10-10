"use client";

import { useState, useEffect } from "react";

interface Candidate {
  id: number;
  name: string;
  jobTitle: string;
  email: string;
  experience: string;
  education: string;
  skills: string[];
  matchScore: number;
}

export default function ComparePage() {
  const [jobs, setJobs] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [selectedA, setSelectedA] = useState<number | null>(null);
  const [selectedB, setSelectedB] = useState<number | null>(null);

  useEffect(() => {
    const mockJobs = [
      "Frontend Developer",
      "Backend Developer",
      "UI/UX Designer",
      "Marketing Specialist",
    ];

    const mockCandidates: Candidate[] = [
      {
        id: 1,
        name: "John Doe",
        jobTitle: "Frontend Developer",
        email: "john.doe@email.com",
        experience: "3 years at ABC Corp",
        education: "BS in Computer Science",
        skills: ["React", "Tailwind", "TypeScript"],
        matchScore: 92,
      },
      {
        id: 2,
        name: "Jane Smith",
        jobTitle: "Frontend Developer",
        email: "jane.smith@email.com",
        experience: "4 years at XYZ Tech",
        education: "BS in Information Technology",
        skills: ["Next.js", "UI Design", "CSS"],
        matchScore: 88,
      },
      {
        id: 3,
        name: "Michael Reyes",
        jobTitle: "Backend Developer",
        email: "michael.reyes@email.com",
        experience: "5 years at Softline Solutions",
        education: "BS in Computer Engineering",
        skills: ["Node.js", "Express", "MongoDB"],
        matchScore: 79,
      },
      {
        id: 4,
        name: "Anna Cruz",
        jobTitle: "UI/UX Designer",
        email: "anna.cruz@email.com",
        experience: "2 years at DesignPro Studio",
        education: "BA in Graphic Design",
        skills: ["Figma", "Adobe XD", "Prototyping"],
        matchScore: 90,
      },
    ];

    setJobs(mockJobs);
    setCandidates(mockCandidates);
  }, []);

  useEffect(() => {
    if (selectedJob) {
      setFilteredCandidates(
        candidates.filter((c) => c.jobTitle === selectedJob)
      );
      setSelectedA(null);
      setSelectedB(null);
    } else {
      setFilteredCandidates([]);
    }
  }, [selectedJob, candidates]);

  const candidateA = filteredCandidates.find((c) => c.id === selectedA);
  const candidateB = filteredCandidates.find((c) => c.id === selectedB);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-red-600 mb-6">
        Compare Candidates
      </h2>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Select Job
        </label>
        <select
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#E30022]"
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
        >
          <option value="">-- Select Job --</option>
          {jobs.map((job) => (
            <option key={job} value={job}>
              {job}
            </option>
          ))}
        </select>
      </div>

      {selectedJob && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Select Candidate A
            </label>
            <select
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#E30022]"
              value={selectedA ?? ""}
              onChange={(e) => setSelectedA(Number(e.target.value))}
            >
              <option value="">-- Select Candidate A --</option>
              {filteredCandidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Select Candidate B
            </label>
            <select
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#E30022]"
              value={selectedB ?? ""}
              onChange={(e) => setSelectedB(Number(e.target.value))}
            >
              <option value="">-- Select Candidate B --</option>
              {filteredCandidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {candidateA && candidateB ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Candidate A */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-[#E30022] mb-2">
              {candidateA.name}
            </h3>
            <p className="text-gray-600 mb-1">{candidateA.jobTitle}</p>
            <p className="text-sm text-gray-500 mb-4">{candidateA.email}</p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Experience:</strong> {candidateA.experience}
              </p>
              <p>
                <strong>Education:</strong> {candidateA.education}
              </p>
              <p>
                <strong>Skills:</strong>{" "}
                {candidateA.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-block bg-[#E30022]/10 text-[#E30022] px-2 py-1 rounded text-xs mr-1 mb-1"
                  >
                    {skill}
                  </span>
                ))}
              </p>
              <p>
                <strong>Match Score:</strong>{" "}
                <span
                  className={`font-semibold ${
                    candidateA.matchScore >= 85
                      ? "text-green-600"
                      : candidateA.matchScore >= 70
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {candidateA.matchScore}%
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center text-gray-500 font-semibold">
            VS
          </div>

          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-[#E30022] mb-2">
              {candidateB.name}
            </h3>
            <p className="text-gray-600 mb-1">{candidateB.jobTitle}</p>
            <p className="text-sm text-gray-500 mb-4">{candidateB.email}</p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Experience:</strong> {candidateB.experience}
              </p>
              <p>
                <strong>Education:</strong> {candidateB.education}
              </p>
              <p>
                <strong>Skills:</strong>{" "}
                {candidateB.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-block bg-[#E30022]/10 text-[#E30022] px-2 py-1 rounded text-xs mr-1 mb-1"
                  >
                    {skill}
                  </span>
                ))}
              </p>
              <p>
                <strong>Match Score:</strong>{" "}
                <span
                  className={`font-semibold ${
                    candidateB.matchScore >= 85
                      ? "text-green-600"
                      : candidateB.matchScore >= 70
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {candidateB.matchScore}%
                </span>
              </p>
            </div>
          </div>
        </div>
      ) : selectedJob ? (
        <p className="text-gray-500 text-center mt-10">
          Please select two candidates to compare.
        </p>
      ) : (
        <p className="text-gray-500 text-center mt-10">
          Select a job to view and compare its candidates.
        </p>
      )}
    </div>
  );
}
