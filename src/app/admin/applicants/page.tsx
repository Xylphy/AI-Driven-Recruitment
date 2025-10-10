"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Candidate {
  id: number;
  name: string;
  email: string;
  jobTitle: string;
  status: string;
  predictiveSuccess: number;
}

export default function ApplicantsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/jobs/applicants", {
      signal: controller.signal,
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
      })
      .then((data) => {
        setCandidates(data.data);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          alert("Failed to fetch candidates. Please try again later.");
        }
      });

    return () => controller.abort();
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
                    {candidate.status || "Pending"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center font-semibold">
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`${
                        candidate.predictiveSuccess >= 85
                          ? "text-green-600"
                          : candidate.predictiveSuccess >= 70
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {candidate.predictiveSuccess}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      className="px-3 py-1 text-sm bg-[#E30022] text-white rounded hover:bg-red-700 transition"
                      onClick={() =>
                        router.push(`/candidateprofile/${candidate.id}`)
                      }
                    >
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
