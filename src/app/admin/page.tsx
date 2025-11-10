"use client";

import Header from "@/components/admin/Header";
import { trpc } from "@/lib/trpc/client";
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

export default function AdminLayout() {
  const statsQuery = trpc.admin.fetchStats.useQuery();

  if (statsQuery.isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex flex-col">
            <Header />

            <main className="flex-1 p-6 overflow-y-auto space-y-8">
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white p-5 rounded-lg shadow-md text-center"
                  >
                    <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-4 animate-pulse" />
                    <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto animate-pulse" />
                  </div>
                ))}
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-lg shadow-md">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
                  <div className="h-64 bg-gray-100 rounded animate-pulse" />
                </div>

                <div className="bg-white p-5 rounded-lg shadow-md">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
                  <div className="h-64 bg-gray-100 rounded animate-pulse" />
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="flex min-h-screen bg-gray-50">
          <div className="flex-1 flex flex-col">
            <Header />

            <main className="flex-1 p-6 overflow-y-auto space-y-8">
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-lg shadow-md text-center">
                  <h3 className="text-gray-500 text-sm">Total Jobs</h3>
                  <p className="text-3xl font-bold text-[#E30022]">
                    {statsQuery.data?.totalJobs || 0}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-lg shadow-md text-center">
                  <h3 className="text-gray-500 text-sm">Total Candidates</h3>
                  <p className="text-3xl font-bold text-[#E30022]">
                    {statsQuery.data?.totalCandidates || 0}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-lg shadow-md text-center">
                  <h3 className="text-gray-500 text-sm">Active Jobs</h3>
                  <p className="text-3xl font-bold text-[#E30022]">
                    {statsQuery.data?.activeJobs || 0}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-lg shadow-md text-center">
                  <h3 className="text-gray-500 text-sm">Shortlisted</h3>
                  <p className="text-3xl font-bold text-[#E30022]">
                    {statsQuery.data?.shortListed || 0}
                  </p>
                </div>
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-lg shadow-md">
                  <h3 className="text-gray-700 font-semibold mb-4">
                    Weekly Job Activity
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={statsQuery.data?.jobActivity?.map((job) => ({
                        name: job.weekday,
                        jobs: job.jobs,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
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
                    <LineChart
                      data={statsQuery.data?.candidateGrowth?.map(
                        (growth, index) => ({
                          name: `Week ${index + 1}`,
                          candidates: growth.applicants,
                        })
                      )}
                    >
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
      </div>
    </div>
  );
}
