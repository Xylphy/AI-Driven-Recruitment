"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import useAuth from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc/client";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

// Add this helper function
function formatDuration(seconds: number): string {
  if (seconds === 0) return "0s";

  const weeks = Math.floor(seconds / 604800);
  const days = Math.floor((seconds % 604800) / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (weeks > 0) parts.push(`${weeks}w`);
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 && parts.length === 0) parts.push(`${secs}s`);

  return parts.slice(0, 2).join(" "); // Show top 2 units
}

type KpiMetric = {
  metric_type: string;
  status_or_stage: string | null;
  value: number | null;
  p50: number | null;
  p75: number | null;
  p90: number | null;
};

export default function KPIMetrics() {
  const today = new Date();
  const { isAuthenticated } = useAuth();

  const [fromDate, setFromDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1).toISOString(),
  );

  const [toDate, setToDate] = useState(
    new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString(),
  );

  const kpiData = trpc.admin.fetchKpiMetrics.useQuery(
    {
      fromDate: fromDate.toString(),
      toDate: toDate.toString(),
    },
    {
      enabled: isAuthenticated,
    },
  );

  const metrics: KpiMetric[] = (kpiData.data?.kpis as KpiMetric[]) ?? [];
  const byType = (type: string) =>
    metrics.filter((m) => m.metric_type === type);
  const one = (type: string) => metrics.find((m) => m.metric_type === type);

  const totalApplicants = Number(one("total_applicants")?.value ?? 0);
  const avgTimeToHireDays = Number(one("avg_time_to_hire_days")?.value ?? 0);
  const successRatePct = Number(one("success_rate_pct")?.value ?? 0);

  const bottlenecks = byType("bottleneck");
  const timeToFillSeconds = bottlenecks.length
    ? Math.max(...bottlenecks.map((b) => Number(b.p75 ?? b.p50 ?? 0)))
    : 0;

  const perRole = byType("per_role");
  const perRoleTimes = byType("per_role_times");
  const roleTimesMap = new Map(
    perRoleTimes.map((r) => [r.status_or_stage ?? "", r]),
  );

  const kpiRows = perRole.map((r) => {
    const roleName = r.status_or_stage ?? "Unknown";
    const roleTimes = roleTimesMap.get(roleName);

    return {
      role: roleName,
      totalApplicants: Number(r.value ?? 0),
      interviewed: "-",
      offers: "-",
      hired: "-",
      avgTimeToHire:
        roleTimes?.p50 != null ? formatDuration(Number(roleTimes.p50)) : "-",
      timeToFill:
        roleTimes?.p75 != null ? formatDuration(Number(roleTimes.p75)) : "-",
      successRate: `${successRatePct.toFixed(1)}%`,
    };
  });

  const funnel = byType("funnel");
  const barData = {
    labels: ["Time to Hire", "Longest Time to Fill"],
    datasets: [
      {
        label: "Average Days",
        data: [avgTimeToHireDays, timeToFillSeconds / 86400],
        backgroundColor: "rgba(220, 38, 38, 0.8)",
      },
    ],
  };

  const pieData = {
    labels: funnel.map((f) => f.status_or_stage ?? "Unknown"),
    datasets: [
      {
        data: funnel.map((f) => Number(f.value ?? 0)),
        backgroundColor: [
          "#DC2626",
          "#F59E0B",
          "#2563EB",
          "#16A34A",
          "#7C3AED",
          "#0891B2",
        ],
      },
    ],
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    const from = fromDate.slice(0, 10);
    const to = toDate.slice(0, 10);

    doc.setFontSize(16);
    doc.text("KPI Metrics Report", 40, 40);

    doc.setFontSize(11);
    doc.text(`Range: ${from} → ${to}`, 40, 65);

    autoTable(doc, {
      head: [
        [
          "Role",
          "Total Applicants",
          "Interviewed",
          "Offers",
          "Hired",
          "Avg Time to Hire",
          "Time to Fill",
          "Success Rate",
        ],
      ],
      body: kpiRows.map((r) => [
        r.role,
        r.totalApplicants,
        r.interviewed,
        r.offers,
        r.hired,
        r.avgTimeToHire,
        r.timeToFill,
        r.successRate,
      ]),
      startY: 90,
      headStyles: { fillColor: [220, 38, 38] },
    });

    doc.save(`kpi_metrics_${from}_to_${to}.pdf`);
  };

  return (
    <div className="min-h-screen p-8 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-red-100 via-white to-red-50 opacity-40 pointer-events-none" />

      <div className="relative z-10 space-y-8">
        <h2 className="text-3xl font-bold text-red-600">
          KPI Metrics Dashboard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: "Total Applicants", value: String(totalApplicants) },
            {
              title: "Avg Time to Hire",
              value: `${avgTimeToHireDays.toFixed(1)} Days`,
            },
            {
              title: "Longest Time to Fill",
              value: formatDuration(timeToFillSeconds),
            },
            {
              title: "Hiring Success Rate",
              value: `${successRatePct.toFixed(1)}%`,
            },
          ].map((kpi) => (
            <div
              key={kpi.title}
              className="backdrop-blur-xl bg-white/60 border border-white/40
              rounded-2xl shadow-xl p-6 text-center
              hover:scale-105 transition-transform duration-300"
            >
              <p className="text-sm text-gray-600">{kpi.title}</p>
              <h3 className="text-2xl font-bold text-red-600 mt-2">
                {kpi.value}
              </h3>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
          <div className="flex gap-2">
            <input
              type="date"
              value={fromDate.slice(0, 10)}
              onChange={(e) =>
                setFromDate(new Date(e.target.value).toISOString())
              }
              className="px-4 py-2 rounded-xl bg-white/70 backdrop-blur border border-red-200 focus:ring-2 focus:ring-red-500"
            />
            <span className="self-center text-gray-600">to</span>
            <input
              type="date"
              value={toDate.slice(0, 10)}
              onChange={(e) =>
                setToDate(new Date(e.target.value).toISOString())
              }
              className="px-4 py-2 rounded-xl bg-white/70 backdrop-blur border border-red-200 focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            type="button"
            onClick={handleDownloadReport}
            className="bg-linear-to-r from-red-600 to-red-500
            text-white font-bold px-6 py-2 rounded-xl
            shadow-lg hover:opacity-90 transition"
          >
            DOWNLOAD REPORT
          </button>
        </div>

        <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-red-50 text-red-600">
              <tr>
                <th className="p-4 text-left">Job Title</th>
                <th className="p-4 text-center">Applicants</th>
                <th className="p-4 text-center">Interviewed</th>
                <th className="p-4 text-center">Offers</th>
                <th className="p-4 text-center">Hired</th>
                <th className="p-4 text-center">Avg Time to Hire</th>
                <th className="p-4 text-center">Time to Fill</th>
                <th className="p-4 text-center">Success Rate</th>
              </tr>
            </thead>

            <tbody>
              {kpiRows.map((row) => (
                <tr key={row.role} className="hover:bg-red-50/40 transition">
                  <td className="p-4 font-medium">{row.role}</td>
                  <td className="p-4 text-center">{row.totalApplicants}</td>
                  <td className="p-4 text-center">{row.interviewed}</td>
                  <td className="p-4 text-center">{row.offers}</td>
                  <td className="p-4 text-center">{row.hired}</td>
                  <td className="p-4 text-center">{row.avgTimeToHire}</td>
                  <td className="p-4 text-center">{row.timeToFill}</td>
                  <td className="p-4 text-center font-semibold text-red-600">
                    {row.successRate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl p-6 rounded-2xl">
            <h3 className="font-semibold mb-4 text-gray-700">
              Hiring Timeline Metrics
            </h3>
            <Bar data={barData} />
          </div>

          <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl p-6 rounded-2xl">
            <h3 className="font-semibold mb-4 text-gray-700">
              Recruitment Funnel Distribution
            </h3>
            <Pie data={pieData} />
          </div>
        </div>
      </div>
    </div>
  );
}
