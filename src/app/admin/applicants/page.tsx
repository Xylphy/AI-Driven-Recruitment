"use client";

import { useState, useEffect } from "react";

interface Candidate {
  id: number;
  name: string;
  email: string;
  jobTitle: string;
  status: string;
  matchScore: number;
}

export default function ApplicantsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    setCandidates([
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@email.com",
        jobTitle: "Frontend Developer",
        status: "Shortlisted",
        matchScore: 92,
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@email.com",
        jobTitle: "UI/UX Designer",
        status: "Interviewed",
        matchScore: 88,
      },
      {
        id: 3,
        name: "Michael Reyes",
        email: "michael.reyes@email.com",
        jobTitle: "Backend Developer",
        status: "Pending Review",
        matchScore: 74,
      },
      {
        id: 4,
        name: "Angela Cruz",
        email: "angela.cruz@email.com",
        jobTitle: "Project Manager",
        status: "Hired",
        matchScore: 95,
      },
    ]);
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-red-600 mb-6">
        Candidate Management
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Job Applied</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Job Match Score</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {candidates.map((candidate) => (
              <tr
                key={candidate.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="py-3 px-4 font-medium">{candidate.name}</td>
                <td className="py-3 px-4">{candidate.email}</td>
                <td className="py-3 px-4">{candidate.jobTitle}</td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      candidate.status === "Hired"
                        ? "bg-green-100 text-green-700"
                        : candidate.status === "Shortlisted"
                        ? "bg-yellow-100 text-yellow-700"
                        : candidate.status === "Interviewed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {candidate.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center font-semibold">
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`${
                        candidate.matchScore >= 85
                          ? "text-green-600"
                          : candidate.matchScore >= 70
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {candidate.matchScore}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button className="px-3 py-1 text-sm bg-[#E30022] text-white rounded hover:bg-red-700 transition">
                      View
                    </button>
                    <button className="px-3 py-1 text-sm border border-[#E30022] text-[#E30022] rounded hover:bg-red-50 transition">
                      Compare
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
