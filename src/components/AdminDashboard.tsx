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
import { ActiveJob, WeeklyCumulativeApplicants } from "@/types/schema";

interface CandidateGrowth {
  name: string;
  candidates: number;
}

interface JobActivityType {
  name: string;
  jobs: number;
}

interface AdminStats {
  totalJobs: number;
  activeJobs: number; // Total Jobs and Active Jobs are the same for now
  totalCandidates: number;
  jobActivity: JobActivityType[];
  shortListed: number;
  candidateGrowth: CandidateGrowth[];
}

interface AdminStatsResponse
  extends Omit<AdminStats, "candidateGrowth" | "jobActivity"> {
  candidateGrowth: WeeklyCumulativeApplicants[];
  jobActivity: ActiveJob[];
}

export default function AdminLayout() {
  const [stats, setStats] = useState<AdminStats>({
    totalJobs: 0,
    totalCandidates: 0,
    activeJobs: 0,
    jobActivity: [],
    shortListed: 0,
    candidateGrowth: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      fetch("/api/admin/stats")
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch stats");
          }
          return res.json();
        })
        .then((data: AdminStatsResponse) => {
          setStats({
            ...data,
            candidateGrowth: data.candidateGrowth.map(
              (item: WeeklyCumulativeApplicants) => ({
                name: `Week ${item.iso_week}`,
                candidates: item.applicants,
              })
            ),
            jobActivity: data.jobActivity.map((item: ActiveJob) => ({
              name: item.weekday,
              jobs: item.jobs,
            })),
          });
        })
        .catch((error) => {
          alert(error.message);
        });
    };

    fetchStats();
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
                {stats.shortListed}
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-lg shadow-md">
              <h3 className="text-gray-700 font-semibold mb-4">
                Weekly Job Activity
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.jobActivity}>
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
                <LineChart data={stats.candidateGrowth}>
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
