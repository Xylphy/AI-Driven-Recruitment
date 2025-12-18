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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);
import type { BottleneckPercentileRow } from "@/types/types";

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
    fromDate: fromDate,
    toDate: toDate,
  });

  const bottlenecks: BottleneckPercentileRow[] = Array.isArray(
    bottleNecksQuery.data
  )
    ? bottleNecksQuery.data
    : bottleNecksQuery.data?.bottlenecks ?? [];

  const barData = {
    labels: bottlenecks.map((b) => b.status),
    datasets: [
      {
        label: "Median Time (p50 seconds)",
        data: bottlenecks.map((b) => b.p50_seconds),
      },
    ],
  };

  const pieData = {
    labels: bottlenecks.map((b) => b.status),
    datasets: [
      {
        data: bottlenecks.map((b) => b.samples),
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
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          <span className="self-center">to</span>
          <input
            type="date"
            value={toDate.slice(0, 10)}
            onChange={(e) => setToDate(new Date(e.target.value).toISOString())}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        <button
          onClick={() => router.push("/profile/edit")}
          className="text-white bg-red-600 font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:border-red-600 hover:text-red-600"
        >
          DOWNLOAD REPORT
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <div className="overflow-auto max-h-[500px]">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="p-4 border-b text-left">Status</th>
                <th className="p-4 border-b text-center">Samples</th>
                <th className="p-4 border-b text-center">p50 (sec)</th>
                <th className="p-4 border-b text-center">p75 (sec)</th>
                <th className="p-4 border-b text-center">p90 (sec)</th>
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
                  <tr
                    key={row.status}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium">{row.status}</td>

                    <td className="p-4 text-center font-semibold">
                      {row.samples}
                    </td>

                    <td className="p-4 text-center">{row.p50_seconds}</td>

                    <td className="p-4 text-center">{row.p75_seconds}</td>

                    <td className="p-4 text-center">{row.p90_seconds}</td>

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
            <h3 className="font-semibold mb-2">Median Time by Status (p50)</h3>
            <Bar data={barData} />
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
