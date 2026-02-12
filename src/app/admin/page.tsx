"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Header from "@/components/admin/Header";
import { formatDate } from "@/lib/library";
import { trpc } from "@/lib/trpc/client";

const GlassCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg p-5">
    <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
    {children}
  </div>
);

export default function AdminDashboard() {
  const statsQuery = trpc.admin.fetchStats.useQuery();
  const { role } = trpc.auth.decodeJWT.useQuery().data?.user || {};
  const auditLogsQuery = trpc.admin.auditLogs.useQuery({
    limit: 5,
    category: "All",
  });
  const topTalentQuery = trpc.admin.topCandidates.useQuery({});

  if (role !== "Admin" && role !== "SuperAdmin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  if (statsQuery.isLoading || auditLogsQuery.isLoading) {
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
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-red-50">
      <Header />

      <main className="p-6 space-y-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Active Jobs", value: statsQuery.data?.activeJobs },
            {
              label: "Total Candidates",
              value: statsQuery.data?.totalCandidates,
            },
            {
              label: "Candidates for Final Interview",
              value: statsQuery.data?.candidatesForFinalInterview,
            },
            { label: "Avg Time-to-Hire", value: "21 days" },
          ].map((item) => (
            <GlassCard key={item.label} title={item.label}>
              <p className="text-3xl font-bold text-red-600">{item.value}</p>
            </GlassCard>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard title="Recruitment Funnel Overview">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statsQuery.data?.candidateStatuses || []}>
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#E30022" />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard title="Top Talent (AI Match >80%)">
            <ul className="space-y-3">
              {topTalentQuery.data?.topCandidates.map((c) => (
                <li
                  key={crypto.randomUUID()}
                  className="flex justify-between items-center bg-white/40 rounded-lg px-4 py-2"
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="text-green-600 font-bold">
                    {c.score_data.predictive_success}%
                  </span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard title="Audit Logs">
            <ul className="space-y-2 text-sm">
              {auditLogsQuery.data?.auditLogs.map((log) => (
                <li key={log.id} className="border-b border-white/30 pb-2">
                  <p>
                    <span className="font-semibold">{log.details}</span>
                  </p>
                  <p className="text-gray-700 text-xs">
                    {formatDate(log.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          </GlassCard>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard title="Candidate Growth">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={statsQuery.data?.candidateGrowth?.map(
                  (growth, index) => ({
                    name: `Week ${index + 1}`,
                    candidates: growth.applicants,
                  }),
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
          </GlassCard>
        </section>
      </main>
    </div>
  );
}
