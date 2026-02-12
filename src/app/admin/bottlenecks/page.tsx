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
  type TooltipItem,
} from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { trpc } from "@/lib/trpc/client";
import type { BottleneckPercentileRow } from "@/types/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

type FormatOpts = {
  maxParts?: number; // how many units to show (e.g. "2d 3h" => 2)
  secondsDecimals?: number; // only applies when < 60s
};

const formatDuration = (
  secondsInput: number | null | undefined,
  opts: FormatOpts = {},
) => {
  if (secondsInput === null || secondsInput === undefined) return "—";
  if (!Number.isFinite(secondsInput)) return "—";

  const maxParts = opts.maxParts ?? 2;
  const secondsDecimals = opts.secondsDecimals ?? 1;

  const sign = secondsInput < 0 ? "-" : "";
  let seconds = Math.abs(secondsInput);

  // Use approximate calendar units for readability
  const YEAR = 365 * 24 * 3600;
  const MONTH = 30 * 24 * 3600;
  const DAY = 24 * 3600;
  const HOUR = 3600;
  const MIN = 60;

  // Special-case very small values
  if (seconds < 60) return `${sign}${seconds.toFixed(secondsDecimals)}s`;

  const units: Array<[string, number]> = [
    ["y", YEAR],
    ["mo", MONTH],
    ["d", DAY],
    ["h", HOUR],
    ["m", MIN],
    ["s", 1],
  ];

  const parts: string[] = [];
  for (const [label, unitSeconds] of units) {
    if (parts.length >= maxParts) break;

    const value =
      label === "s"
        ? Math.floor(seconds) // no decimals once we’re showing m/h/d/etc
        : Math.floor(seconds / unitSeconds);

    if (value <= 0) continue;

    parts.push(`${value}${label}`);
    seconds -= value * unitSeconds;
  }

  return parts.length ? `${sign}${parts.join(" ")}` : "0s";
};

const parseIntervalToSeconds = (interval: string | null | undefined) => {
  if (!interval) return null;

  // Handles:
  //  - "25:43:42.04866" (HH:MM:SS(.ffffff), hours may exceed 24)
  //  - "2 days 03:04:05.12"
  const dayMatch = interval.match(
    /(?:(\d+)\s+days?\s+)?(\d+):(\d+):(\d+(?:\.\d+)?)/i,
  );
  if (!dayMatch) return null;

  const days = dayMatch[1] ? Number(dayMatch[1]) : 0;
  const hours = Number(dayMatch[2]);
  const minutes = Number(dayMatch[3]);
  const secs = Number(dayMatch[4]);

  if (![days, hours, minutes, secs].every(Number.isFinite)) return null;
  return days * 86400 + hours * 3600 + minutes * 60 + secs;
};

const formatInterval = (interval: string | null | undefined) => {
  const parsed = parseIntervalToSeconds(interval);
  if (parsed === null) return interval ?? "—";
  return formatDuration(parsed);
};

const barOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<"bar">) =>
          `${context.dataset.label}: ${formatDuration(context.raw as number)}`,
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

export default function JobsPage() {
  const today = new Date();

  const [fromDate, setFromDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1).toISOString(),
  );

  const [toDate, setToDate] = useState(
    new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString(),
  );

  const bottleNecksQuery = trpc.admin.getBottlenecks.useQuery({
    fromDate,
    toDate,
  });

  const bottlenecks: BottleneckPercentileRow[] = Array.isArray(
    bottleNecksQuery.data,
  )
    ? bottleNecksQuery.data
    : (bottleNecksQuery.data?.bottlenecks ?? []);

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

  const handleDownloadReport = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    const from = fromDate.slice(0, 10);
    const to = toDate.slice(0, 10);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Bottlenecks Report", 40, 40);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Range: ${from} → ${to}`, 40, 62);
    doc.text(
      `Generated: ${new Date().toISOString().slice(0, 19).replace("T", " ")}`,
      40,
      80,
    );

    const head = [
      [
        "Status",
        "Samples",
        "p50 (readable)",
        "p75 (readable)",
        "p90 (readable)",
        "p50 Interval",
        "p75 Interval",
        "p90 Interval",
      ],
    ];

    const body = bottlenecks.map((r) => [
      r.status,
      String(r.samples ?? "—"),
      formatDuration(r.p50_seconds),
      formatDuration(r.p75_seconds),
      formatDuration(r.p90_seconds),
      formatInterval(r.p50_interval),
      formatInterval(r.p75_interval),
      formatInterval(r.p90_interval),
    ]);

    autoTable(doc, {
      head,
      body,
      startY: 100,
      styles: { font: "helvetica", fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [239, 68, 68] }, // tailwind red-500-ish
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 140 }, // Status
        1: { halign: "center" }, // Samples
        2: { halign: "center" },
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
        6: { halign: "center" },
        7: { halign: "center" },
      },
    });

    const filename = `bottlenecks_${from}_to_${to}.pdf`;
    doc.save(filename);
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
          className="text-white bg-red-600 font-bold px-4 py-2 rounded transition hover:bg-transparent hover:text-red-600 hover:border hover:border-red-600"
          onClick={handleDownloadReport}
          type="button"
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
                      {row.p50_seconds}
                    </td>
                    <td className="p-4 text-center font-mono">
                      {row.p75_seconds}
                    </td>
                    <td className="p-4 text-center font-mono">
                      {row.p90_seconds}
                    </td>

                    <td className="p-4 text-center font-mono text-gray-600">
                      {formatInterval(row.p50_interval)}
                    </td>
                    <td className="p-4 text-center font-mono text-gray-600">
                      {formatInterval(row.p75_interval)}
                    </td>
                    <td className="p-4 text-center font-mono text-gray-600">
                      {formatInterval(row.p90_interval)}
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
