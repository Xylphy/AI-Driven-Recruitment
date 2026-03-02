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
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import useAuth from "@/hooks/useAuth";
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

const barOptions = {
  responsive: true,
  plugins: {
    legend: { position: "top" as const },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<"bar">) =>
          `${context.dataset.label}: ${context.raw}s`,
      },
    },
  },
};

export default function JobsPage() {
  const { isAuthenticated } = useAuth();
  const today = new Date();

  const [fromDate, setFromDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1).toISOString(),
  );

  const [toDate, setToDate] = useState(
    new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString(),
  );

  const bottleNecksQuery = trpc.admin.getBottlenecks.useQuery(
    {
      fromDate,
      toDate,
    },
    {
      enabled: isAuthenticated,
    },
  );

  const bottlenecks: BottleneckPercentileRow[] = Array.isArray(
    bottleNecksQuery.data,
  )
    ? bottleNecksQuery.data
    : (bottleNecksQuery.data?.bottlenecks ?? []);

  const barData = {
    labels: bottlenecks.map((b) => b.status),
    datasets: [
      {
        label: "p50",
        data: bottlenecks.map((b) => b.p50_seconds),
        backgroundColor: "rgba(220,38,38,0.7)",
      },
      {
        label: "p75",
        data: bottlenecks.map((b) => b.p75_seconds),
        backgroundColor: "rgba(239,68,68,0.6)",
      },
      {
        label: "p90",
        data: bottlenecks.map((b) => b.p90_seconds),
        backgroundColor: "rgba(185,28,28,0.8)",
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
          "#EF4444",
          "#F87171",
          "#FCA5A5",
          "#991B1B",
        ],
      },
    ],
  };

  const autoFitColumns = (worksheet: ExcelJS.Worksheet) => {
    worksheet.columns?.forEach((col) => {
      let maxLength = 10;
      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const v = cell.value;
        const text =
          v == null
            ? ""
            : typeof v === "object"
              ? JSON.stringify(v)
              : String(v);
        maxLength = Math.max(maxLength, text.length);
      });
      col.width = Math.min(60, Math.max(10, maxLength + 2));
    });
  };

  const handleDownloadReport = async () => {
    const from = fromDate.slice(0, 10);
    const to = toDate.slice(0, 10);

    const wb = new ExcelJS.Workbook();
    wb.creator = "Your App";
    wb.created = new Date();

    const ws = wb.addWorksheet("Bottlenecks Report");

    ws.mergeCells("A1:E1");
    ws.getCell("A1").value = "Bottlenecks Report";
    ws.getCell("A1").font = { size: 16, bold: true };
    ws.getCell("A1").alignment = { vertical: "middle", horizontal: "left" };

    ws.mergeCells("A2:E2");
    ws.getCell("A2").value = `Range: ${from} → ${to}`;
    ws.getCell("A2").font = { size: 11 };
    ws.getCell("A2").alignment = { vertical: "middle", horizontal: "left" };

    ws.addRow([]);

    const headerRowIndex = 4;

    ws.getRow(headerRowIndex).values = [
      "Status",
      "Samples",
      "p50 (s)",
      "p75 (s)",
      "p90 (s)",
    ];

    const headerRow = ws.getRow(headerRowIndex);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.alignment = { vertical: "middle", horizontal: "left" };
    headerRow.height = 18;

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFDC2626" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    bottlenecks.forEach((r) => {
      ws.addRow([
        r.status,
        Number(r.samples ?? 0),
        Number(r.p50_seconds ?? 0),
        Number(r.p75_seconds ?? 0),
        Number(r.p90_seconds ?? 0),
      ]);
    });

    ws.getColumn(2).numFmt = "#,##0"; // Samples
    ws.getColumn(3).numFmt = "0.00"; // p50
    ws.getColumn(4).numFmt = "0.00"; // p75
    ws.getColumn(5).numFmt = "0.00"; // p90

    ws.views = [{ state: "frozen", ySplit: headerRowIndex }];

    ws.autoFilter = {
      from: { row: headerRowIndex, column: 1 },
      to: { row: headerRowIndex, column: 5 },
    };

    ws.eachRow((row, rowNumber) => {
      if (rowNumber > headerRowIndex) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }
    });

    autoFitColumns(ws);

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `bottlenecks_${from}_to_${to}.xlsx`);
  };

  return (
    <div className="min-h-screen p-8 space-y-6 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-red-100 via-white to-red-50 opacity-40 pointer-events-none" />

      <div className="relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-3xl font-bold bg-linear-to-r from-red-600 to-red-600 bg-clip-text text-transparent">
            Bottlenecks
          </h2>

          <div className="flex flex-wrap items-center gap-4">
            <input
              type="date"
              value={fromDate.slice(0, 10)}
              onChange={(e) =>
                setFromDate(new Date(e.target.value).toISOString())
              }
              className="px-5 py-2 rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 shadow-inner focus:ring-2 focus:ring-red-400"
            />

            <span className="text-gray-600 font-medium">to</span>

            <input
              type="date"
              value={toDate.slice(0, 10)}
              onChange={(e) =>
                setToDate(new Date(e.target.value).toISOString())
              }
              className="px-5 py-2 rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 shadow-inner focus:ring-2 focus:ring-red-400"
            />

            <button
              type="button"
              onClick={handleDownloadReport}
              className="px-6 py-2 rounded-2xl bg-linear-to-r from-red-600 to-red-500 text-white font-semibold shadow-lg hover:scale-105 transition-all duration-300"
            >
              DOWNLOAD REPORT
            </button>
          </div>
        </div>
        <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-red-50 text-red-600">
              <tr>
                <th className="py-4 px-6 text-left">Status</th>
                <th className="py-4 px-6 text-center">Samples</th>
                <th className="py-4 px-6 text-center">p50</th>
                <th className="py-4 px-6 text-center">p75</th>
                <th className="py-4 px-6 text-center">p90</th>
              </tr>
            </thead>

            <tbody>
              {bottleNecksQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center p-8">
                    Loading bottlenecks...
                  </td>
                </tr>
              ) : bottlenecks.length > 0 ? (
                bottlenecks.map((row) => (
                  <tr
                    key={row.status}
                    className="border-white/20 hover:bg-white/30 transition"
                  >
                    <td className="py-4 px-6 font-medium">{row.status}</td>
                    <td className="py-4 px-6 text-center">{row.samples}</td>
                    <td className="py-4 px-6 text-center font-mono">
                      {row.p50_seconds}
                    </td>
                    <td className="py-4 px-6 text-center font-mono">
                      {row.p75_seconds}
                    </td>
                    <td className="py-4 px-6 text-center font-mono">
                      {row.p90_seconds}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center p-8 italic">
                    No bottleneck data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-3xl backdrop-blur-2xl bg-white/30 border border-white/20 shadow-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Time Distribution</h3>
            <Bar data={barData} options={barOptions} />
          </div>

          <div className="rounded-3xl backdrop-blur-2xl bg-white/30 border border-white/20 shadow-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Sample Distribution</h3>
            <Pie data={pieData} />
          </div>
        </div>
      </div>
    </div>
  );
}
