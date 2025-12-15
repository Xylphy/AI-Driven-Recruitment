"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const bottlenecksData = [
  {
    id: 1,
    bottleneck: "Slow resume screening",
    category: "Screening",
    date: "2025-12-10",
    time: "09:30 AM",
  },
  {
    id: 2,
    bottleneck: "Low qualified applicants",
    category: "Pipeline",
    date: "2025-12-10",
    time: "10:15 AM",
  },
  {
    id: 3,
    bottleneck: "Delayed HR feedback",
    category: "Interview",
    date: "2025-12-11",
    time: "02:00 PM",
  },
  {
    id: 4,
    bottleneck: "High candidate drop-off",
    category: "Pipeline",
    date: "2025-12-11",
    time: "11:45 AM",
  },
  {
    id: 5,
    bottleneck: "Ghosting during scheduling",
    category: "Interview",
    date: "2025-12-12",
    time: "01:20 PM",
  },
  {
    id: 6,
    bottleneck: "Low match scores",
    category: "Screening",
    date: "2025-12-12",
    time: "03:10 PM",
  },
];

export default function JobsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  const filteredData = bottlenecksData.filter((item) => {
    const matchesSearch = item.bottleneck
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;

    const itemDate = new Date(item.date);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    const matchesDate = (!from || itemDate >= from) && (!to || itemDate <= to);

    const [hours, minutes] = item.time.split(":").map(Number);
    const itemTimeMinutes = hours * 60 + minutes;

    const parseTimeToMinutes = (time: string) => {
      if (!time) return null;
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const fromTimeMinutes = parseTimeToMinutes(fromTime);
    const toTimeMinutes = parseTimeToMinutes(toTime);

    const matchesTime =
      (!fromTimeMinutes || itemTimeMinutes >= fromTimeMinutes) &&
      (!toTimeMinutes || itemTimeMinutes <= toTimeMinutes);

    return matchesSearch && matchesCategory && matchesDate && matchesTime;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-red-600">Audit Logs</h2>

      <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
        >
          <option value="All">All Categories</option>
          <option value="Screening">Screening</option>
          <option value="Pipeline">Pipeline</option>
          <option value="Interview">Interview</option>
        </select>

        <div className="flex gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          <span className="self-center">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <input
            type="time"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          <span className="self-center">to</span>
          <input
            type="time"
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
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
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-left">
            <tr>
              <th className="p-4 font-semibold border-b">Description</th>
              <th className="p-4 font-semibold border-b">Category</th>
              <th className="p-4 font-semibold border-b">Date</th>
              <th className="p-4 font-semibold border-b">Time</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <tr
                  key={row.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-4">{row.bottleneck}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          row.category === "Screening"
                            ? "bg-blue-100 text-blue-700"
                            : row.category === "Pipeline"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }
                      `}
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
        </table>
      </div>
    </div>
  );
}
