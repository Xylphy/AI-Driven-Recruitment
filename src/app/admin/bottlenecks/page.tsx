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
        <div className="overflow-auto max-h-125 bg-white shadow-md rounded-lg">
          {/* <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-gray-700 text-left">
              <tr>
                <th className="p-4 font-semibold border-b">Description</th>
                <th className="p-4 font-semibold border-b">Category</th>
                <th className="p-4 font-semibold border-b">Date</th>
                <th className="p-4 font-semibold border-b">Time</th>
              </tr>
            </thead>
            <tbody> */}
          {/* {bottleNecksQuery.data &&
              bottleNecksQuery.data.bottlenecks.length > 0 ? (
                bottleNecksQuery.data.bottlenecks.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-4">{row}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          row.category === "Screening"
                            ? "bg-blue-100 text-blue-700"
                            : row.category === "Pipeline"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {row.category}
                      </span>
                    </td>
                    <td className="p-4">{row.date}</td>
                    <td className="p-4">{row.time}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center p-6 text-gray-500 italic"
                  >
                    No bottlenecks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table> */}
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 shadow rounded-lg">
            <h3 className="font-semibold mb-2">Bottlenecks by Category</h3>
            <Bar data={barData} />
          </div>

          <div className="bg-white p-4 shadow rounded-lg">
            <h3 className="font-semibold mb-2">Category Distribution</h3>
            <Pie
              data={{
                labels: Object.keys(categoryCounts),
                datasets: [
                  {
                    data: Object.values(categoryCounts),
                    backgroundColor: ["#3b82f6", "#facc15", "#22c55e"],
                  },
                ],
              }}
            />
          </div>
        </div> */}
      </div>
    </div>
  );
}
