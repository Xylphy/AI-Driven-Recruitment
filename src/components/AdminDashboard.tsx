"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const jobActivity = [
  { name: "Mon", jobs: 2 },
  { name: "Tue", jobs: 5 },
  { name: "Wed", jobs: 3 },
  { name: "Thu", jobs: 7 },
  { name: "Fri", jobs: 4 },
];

const candidateGrowth = [
  { name: "Week 1", candidates: 25 },
  { name: "Week 2", candidates: 40 },
  { name: "Week 3", candidates: 32 },
  { name: "Week 4", candidates: 50 },
];

export default function AdminLayout() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCandidates: 0,
    activeJobs: 0,
    shortlisted: 0,
  });

  useEffect(() => {
    setStats({
      totalJobs: 24,
      totalCandidates: 186,
      activeJobs: 15,
      shortlisted: 32,
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6 overflow-y-auto space-y-8">
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-lg shadow-md text-center">
              <h3 className="text-gray-500 text-sm">Total Jobs</h3>
              <p className="text-3xl font-bold text-[#E30022]">
                {stats.totalJobs}
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-md text-center">
              <h3 className="text-gray-500 text-sm">Total Candidates</h3>
              <p className="text-3xl font-bold text-[#E30022]">
                {stats.totalCandidates}
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-md text-center">
              <h3 className="text-gray-500 text-sm">Active Jobs</h3>
              <p className="text-3xl font-bold text-[#E30022]">
                {stats.activeJobs}
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-md text-center">
              <h3 className="text-gray-500 text-sm">Shortlisted</h3>
              <p className="text-3xl font-bold text-[#E30022]">
                {stats.shortlisted}
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-lg shadow-md">
              <h3 className="text-gray-700 font-semibold mb-4">
                Weekly Job Activity
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={jobActivity}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="jobs" fill="#E30022" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-md">
              <h3 className="text-gray-700 font-semibold mb-4">
                Candidate Growth
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={candidateGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="candidates"
                    stroke="#E30022"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
