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
  LineElement,
  PointElement,
} from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

export default function AIAnalyticsDashboard() {
  const today = new Date();

  const [fromDate, setFromDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1).toISOString(),
  );

  const [toDate, setToDate] = useState(
    new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString(),
  );

  // Sample AI Metrics
  const aiRows = [
    {
      model: "Candidate Fit Predictor",
      accuracy: "92%",
      precision: "89%",
      recall: "87%",
      avgResponseTime: "1.2s",
      recommendationEfficiency: "94%",
    },
    {
      model: "Interview Scoring AI",
      accuracy: "88%",
      precision: "85%",
      recall: "83%",
      avgResponseTime: "1.6s",
      recommendationEfficiency: "90%",
    },
  ];

  const performanceTrendData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Prediction Accuracy (%)",
        data: [85, 88, 91, 92],
        borderColor: "rgb(220, 38, 38)",
        backgroundColor: "rgba(220, 38, 38, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const confidenceDistributionData = {
    labels: ["High Confidence", "Medium Confidence", "Low Confidence"],
    datasets: [
      {
        data: [65, 25, 10],
        backgroundColor: ["#DC2626", "#F59E0B", "#2563EB"],
      },
    ],
  };

  const efficiencyBarData = {
    labels: ["Recommendation Speed", "Decision Accuracy", "Bias Reduction"],
    datasets: [
      {
        label: "Efficiency Score (%)",
        data: [94, 92, 89],
        backgroundColor: "rgba(220, 38, 38, 0.8)",
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
    doc.text("AI Performance & Accuracy Report", 40, 40);

    doc.setFontSize(11);
    doc.text(`Range: ${from} → ${to}`, 40, 65);

    autoTable(doc, {
      head: [
        [
          "Model",
          "Accuracy",
          "Precision",
          "Recall",
          "Avg Response Time",
          "Recommendation Efficiency",
        ],
      ],
      body: aiRows.map((r) => [
        r.model,
        r.accuracy,
        r.precision,
        r.recall,
        r.avgResponseTime,
        r.recommendationEfficiency,
      ]),
      startY: 90,
      headStyles: { fillColor: [220, 38, 38] },
    });

    doc.save(`ai_analytics_${from}_to_${to}.pdf`);
  };

  return (
    <div className="min-h-screen p-8 bg-white relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-100 via-white to-red-50 opacity-40 pointer-events-none" />

      <div className="relative z-10 space-y-8">
        <h2 className="text-3xl font-bold text-red-600">
          AI Analytics Dashboard
        </h2>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: "Overall Accuracy", value: "92%" },
            { title: "Recommendation Efficiency", value: "94%" },
            { title: "Avg AI Response Time", value: "1.3s" },
            { title: "Bias Reduction Score", value: "89%" },
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

        {/* DATE FILTER + DOWNLOAD */}
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
            className="bg-gradient-to-r from-red-600 to-red-500
            text-white font-bold px-6 py-2 rounded-xl
            shadow-lg hover:opacity-90 transition"
          >
            DOWNLOAD AI REPORT
          </button>
        </div>

        {/* TABLE */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-red-50 text-red-600">
              <tr>
                <th className="p-4 text-left">Model</th>
                <th className="p-4 text-center">Accuracy</th>
                <th className="p-4 text-center">Precision</th>
                <th className="p-4 text-center">Recall</th>
                <th className="p-4 text-center">Avg Response</th>
                <th className="p-4 text-center">Efficiency</th>
              </tr>
            </thead>

            <tbody>
              {aiRows.map((row, index) => (
                <tr key={index} className="hover:bg-red-50/40 transition">
                  <td className="p-4 font-medium">{row.model}</td>
                  <td className="p-4 text-center">{row.accuracy}</td>
                  <td className="p-4 text-center">{row.precision}</td>
                  <td className="p-4 text-center">{row.recall}</td>
                  <td className="p-4 text-center">{row.avgResponseTime}</td>
                  <td className="p-4 text-center font-semibold text-red-600">
                    {row.recommendationEfficiency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl p-6 rounded-2xl">
            <h3 className="font-semibold mb-4 text-gray-700">
              Prediction Accuracy Trend
            </h3>
            <Line data={performanceTrendData} />
          </div>

          <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl p-6 rounded-2xl">
            <h3 className="font-semibold mb-4 text-gray-700">
              Confidence Distribution
            </h3>
            <Pie data={confidenceDistributionData} />
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl p-6 rounded-2xl">
          <h3 className="font-semibold mb-4 text-gray-700">
            AI Efficiency Breakdown
          </h3>
          <Bar data={efficiencyBarData} />
        </div>
      </div>
    </div>
  );
}
