"use client";

import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import type { BottleneckPercentileRow } from "@/types/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function JobsPage() {
  const router = useRouter();
  const today = new Date();

  const [fromDate, setFromDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
  );

  const [toDate, setToDate] = useState(
    new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString()
  );

  const bottleNecksQuery = trpc.admin.getBottlenecks.useQuery({
    fromDate,
    toDate,
  });

  const bottlenecks: BottleneckPercentileRow[] = Array.isArray(
    bottleNecksQuery.data
  )
    ? bottleNecksQuery.data
    : bottleNecksQuery.data?.bottlenecks ?? [];

  const formatSeconds = (seconds: number) => {
    if (seconds === null || seconds === undefined) return "—";

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = (seconds % 60).toFixed(2);

    const pad = (n: number) => String(n).padStart(2, "0");

    return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(Number(secs))}`;
  };

  const barData = {
    labels: bottlenecks.map((b) => b.status),
    datasets: [
      {
        label: "p50 (Median)",
        data: bottlenecks.map((b) => b.p50_seconds),
        backgroundColor: "rgba(220, 38, 38, 0.8)", // red
      },
      {
        label: "p75",
        data: bottlenecks.map((b) => b.p75_seconds),
        backgroundColor: "rgba(245, 158, 11, 0.8)", // amber
      },
      {
        label: "p90",
        data: bottlenecks.map((b) => b.p90_seconds),
        backgroundColor: "rgba(37, 99, 235, 0.8)", // blue
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) =>
            `${context.dataset.label}: ${formatSeconds(context.raw)}`,
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Time (seconds)",
        },
      },
    },
  };

  const pieData = {
    labels: bottlenecks.map((b) => b.status),
    datasets: [
      {
        data: bottlenecks.map((b) => b.samples),
        backgroundColor: [
          "#DC2626",
          "#F59E0B",
          "#2563EB",
          "#16A34A",
          "#7C3AED",
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-red-600">Bottlenecks Dashboard</h2>

      <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
        <div className="flex gap-2">
          <input
            type="date"
            value={fromDate.slice(0, 10)}
            onChange={(e) =>
              setFromDate(new Date(e.target.value).toISOString())
            }
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
          />
          <span className="self-center">to</span>
          <input
            type="date"
            value={toDate.slice(0, 10)}
            onChange={(e) => setToDate(new Date(e.target.value).toISOString())}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </div>

        <button
          onClick={() => router.push("/profile/edit")}
          className="text-white bg-red-600 font-bold px-4 py-2 rounded transition hover:bg-transparent hover:text-red-600 hover:border hover:border-red-600"
        >
          DOWNLOAD REPORT
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <div className="overflow-auto max-h-125">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="p-4 border-b text-left">Status</th>
                <th className="p-4 border-b text-center">Samples</th>
                <th className="p-4 border-b text-center">p50 (dd:hh:mm:ss)</th>
                <th className="p-4 border-b text-center">p75 (dd:hh:mm:ss)</th>
                <th className="p-4 border-b text-center">p90 (dd:hh:mm:ss)</th>
                <th className="p-4 border-b text-center">p50 Interval</th>
                <th className="p-4 border-b text-center">p75 Interval</th>
                <th className="p-4 border-b text-center">p90 Interval</th>
              </tr>
            </thead>

            <tbody>
              {bottleNecksQuery.isLoading ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500">
                    Loading bottlenecks…
                  </td>
                </tr>
              ) : bottlenecks.length > 0 ? (
                bottlenecks.map((row) => (
                  <tr key={row.status} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-medium">{row.status}</td>
                    <td className="p-4 text-center font-semibold">
                      {row.samples}
                    </td>
                    <td className="p-4 text-center font-mono">
                      {formatSeconds(row.p50_seconds)}
                    </td>
                    <td className="p-4 text-center font-mono">
                      {formatSeconds(row.p75_seconds)}
                    </td>
                    <td className="p-4 text-center font-mono">
                      {formatSeconds(row.p90_seconds)}
                    </td>
                    <td className="p-4 text-center font-mono text-gray-600">
                      {row.p50_interval}
                    </td>
                    <td className="p-4 text-center font-mono text-gray-600">
                      {row.p75_interval}
                    </td>
                    <td className="p-4 text-center font-mono text-gray-600">
                      {row.p90_interval}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="p-6 text-center text-gray-500 italic"
                  >
                    No bottleneck data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-4 shadow rounded-lg">
            <h3 className="font-semibold mb-2">Time Distribution by Status</h3>
            <Bar data={barData} options={barOptions} />
          </div>

          <div className="bg-white p-4 shadow rounded-lg">
            <h3 className="font-semibold mb-2">Samples Distribution</h3>
            <Pie data={pieData} />
          </div>
        </div>
      </div>
    </div>
  );
}
