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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

export default function KPIMetrics() {
  const today = new Date();

  const [fromDate, setFromDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1).toISOString(),
  );

  const [toDate, setToDate] = useState(
    new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString(),
  );

  const kpiRows = [
    {
      role: "Software Engineer",
      totalApplicants: 120,
      interviewed: 40,
      offers: 10,
      hired: 6,
      avgTimeToHire: "14d",
      timeToFill: "21d",
      successRate: "5%",
    },
    {
      role: "UI/UX Designer",
      totalApplicants: 80,
      interviewed: 30,
      offers: 8,
      hired: 4,
      avgTimeToHire: "12d",
      timeToFill: "18d",
      successRate: "5%",
    },
  ];

  const barData = {
    labels: ["Time to Hire", "Time to Fill"],
    datasets: [
      {
        label: "Average Days",
        data: [14, 21],
        backgroundColor: "rgba(220, 38, 38, 0.8)",
      },
    ],
  };

  const pieData = {
    labels: ["Applicants", "Interviewed", "Offers", "Hired"],
    datasets: [
      {
        data: [200, 70, 18, 10],
        backgroundColor: ["#DC2626", "#F59E0B", "#2563EB", "#16A34A"],
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
      <div className="absolute inset-0 bg-gradient-to-br from-red-100 via-white to-red-50 opacity-40 pointer-events-none" />

      <div className="relative z-10 space-y-8">
        <h2 className="text-3xl font-bold text-red-600">
          KPI Metrics Dashboard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: "Total Applicants", value: "200" },
            { title: "Avg Time to Hire", value: "14 Days" },
            { title: "Time to Fill", value: "21 Days" },
            { title: "Hiring Success Rate", value: "5%" },
          ].map((kpi, i) => (
            <div
              key={i}
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
            onClick={handleDownloadReport}
            className="bg-gradient-to-r from-red-600 to-red-500
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
                <th className="p-4 text-left">Role</th>
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
              {kpiRows.map((row, index) => (
                <tr key={index} className="hover:bg-red-50/40 transition">
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
