"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useMemo, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import Select from "react-select";
import HRReportCard from "@/components/admin/aiMetrics/HRReportCard";
import useAuth from "@/hooks/useAuth";
import { MONTHS } from "@/lib/constants";
import { trpc } from "@/lib/trpc/client";

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

function predictionData(data: Array<number>) {
  return {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Job Fit Score (%)",
        data,
        borderColor: "rgb(220, 38, 38)",
        backgroundColor: "rgba(220, 38, 38, 0.2)",
        tension: 0.4,
      },
    ],
  };
}

function responseData(data: Array<number>) {
  return {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Response Time (%)",
        data,
        borderColor: "rgb(220, 38, 38)",
        backgroundColor: "rgba(220, 38, 38, 0.2)",
        tension: 0.4,
      },
    ],
  };
}

const YM_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

function isYearMonth(v: string) {
  return YM_RE.test(v);
}

function compareYM(a: string, b: string) {
  return a.localeCompare(b);
}

function getThisYM() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

const formatScore = (value?: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value ?? 0);

export default function AIAnalyticsDashboard() {
  const thisYM = useMemo(() => getThisYM(), []);

  const [fromYM, setFromYM] = useState<string>(thisYM);
  const [toYM, setToYM] = useState<string>(thisYM);

  const rangeInvalid =
    !isYearMonth(fromYM) || !isYearMonth(toYM) || compareYM(fromYM, toYM) > 0;

  const { isAuthenticated } = useAuth();

  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null,
  );

  const candidateReportQuery = trpc.candidate.candidateAIBreakdown.useQuery(
    {
      // biome-ignore lint/style/noNonNullAssertion: This is safe because the query is disabled when selectedCandidateId is null.
      candidateId: selectedCandidateId!,
    },
    {
      enabled: !!selectedCandidateId && isAuthenticated,
    },
  );

  const aiMetrics = trpc.staff.fetchAIMetrics.useQuery({
    // this should be dynamic based on user input.
    year: 2026,
    month: 2,
  });

  const candidates = trpc.candidate.getCandidates.useQuery(
    {
      searchQuery: "",
    },
    {
      enabled: isAuthenticated,
    },
  );
  const hrReports = trpc.staff.fetchHRReports.useQuery(
    {
      // biome-ignore lint/style/noNonNullAssertion: This is safe because the query is disabled when selectedCandidateId is null.
      applicantId: selectedCandidateId!,
    },
    {
      enabled: !!selectedCandidateId && isAuthenticated,
    },
  );

  const efficiencyBarData = {
    labels: ["Predictive Success", "Decision Accuracy", "Job Fit"],
    datasets: [
      {
        label: "Efficiency Score (%)",
        data: [candidateReportQuery.data?.candidate.job_fit_score || 0, 92, 89],
        backgroundColor: "rgba(220, 38, 38, 0.8)",
      },
    ],
  };

  const onChangeFrom = (v: string) => {
    if (!isYearMonth(v)) return; // ignore invalid edits
    setFromYM(v);
    if (isYearMonth(toYM) && compareYM(v, toYM) > 0) setToYM(v);
  };

  const onChangeTo = (v: string) => {
    if (!isYearMonth(v)) return;
    setToYM(v);
    if (isYearMonth(fromYM) && compareYM(fromYM, v) > 0) setFromYM(v);
  };

  const handleDownloadReport = () => {
    if (rangeInvalid) return;

    const [fy, fm] = fromYM.split("-");
    const [ty, tm] = toYM.split("-");
    const from = `${MONTHS[Number(fm) - 1]} ${fy}`;
    const to = `${MONTHS[Number(tm) - 1]} ${ty}`;

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
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
      startY: 90,
      headStyles: { fillColor: [220, 38, 38] },
    });

    // safer filename: no spaces/special chars
    doc.save(`ai_analytics_${fromYM}_to_${toYM}.pdf`);
  };

  return (
    <div className="min-h-screen p-8 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-red-100 via-white to-red-50 opacity-40 pointer-events-none" />

      <div className="relative z-10 space-y-8">
        <h2 className="text-3xl font-bold text-red-600">
          AI Analytics Dashboard
        </h2>

        <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
          <div className="flex gap-3 items-center">
            <input
              type="month"
              value={fromYM}
              onChange={(e) => onChangeFrom(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/70 backdrop-blur border border-red-200 focus:ring-2 focus:ring-red-500"
            />

            <span className="text-gray-600 font-medium">to</span>

            <input
              type="month"
              value={toYM}
              onChange={(e) => onChangeTo(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/70 backdrop-blur border border-red-200 focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={rangeInvalid}
            className={`bg-linear-to-r from-red-600 to-red-500 text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:opacity-90 transition
          ${rangeInvalid ? "opacity-50 cursor-not-allowed hover:opacity-50" : ""}`}
            title={
              rangeInvalid
                ? "Select a valid month range (From must be <= To)"
                : ""
            }
          >
            DOWNLOAD AI REPORT
          </button>

          {rangeInvalid && (
            <div className="text-sm text-red-600">
              Please select a valid month range (format YYYY-MM, and From must
              be before or equal to To).
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "Average Job Fit Score",
              value: formatScore(aiMetrics.data?.overall.avg_job_fit_score),
            },
            {
              title: "Avg AI Response Time",
              value: `${formatScore(aiMetrics.data?.overall.avg_response_time)}s`,
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl p-6 rounded-2xl">
            <h3 className="font-semibold mb-4 text-gray-700">
              Average Job Fit Score Overtime
            </h3>
            <Line
              data={predictionData(
                aiMetrics.data?.weekly.map((w) => w.avg_job_fit_score) || [],
              )}
            />
          </div>
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl p-6 rounded-2xl">
            <h3 className="font-semibold mb-4 text-gray-700">
              Average AI Response Time Overtime
            </h3>
            <Line
              data={responseData(
                aiMetrics.data?.weekly.map((w) => w.avg_response_time) || [],
              )}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end gap-6 flex-wrap">
          <div className="flex flex-col gap-2 w-72">
            <label
              htmlFor="candidate-select"
              className="text-sm font-medium text-gray-600 tracking-wide"
            >
              Select Candidate
            </label>

            <Select
              inputId="candidate-select"
              options={candidates.data?.map((c) => ({
                value: c.id,
                label: `${c.first_name} ${c.last_name}`,
              }))}
              placeholder="Type candidate name..."
              isSearchable
              className="text-sm"
              onChange={(option) =>
                setSelectedCandidateId(option?.value || null)
              }
              classNames={{
                control: ({ isFocused }) =>
                  `
                    px-2 py-1
                    rounded-xl
                    bg-white/70 backdrop-blur
                    border ${
                      isFocused
                        ? "border-red-500 ring-2 ring-red-500/30"
                        : "border-red-200"
                    }
                    shadow-md
                    hover:border-red-400
                    transition-all duration-200
                  `,
                menu: () =>
                  `
                    mt-2
                    rounded-xl
                    bg-white/80 backdrop-blur-xl
                    border border-red-100
                    shadow-xl
                    overflow-hidden
                  `,
                option: ({ isFocused, isSelected }) =>
                  `
                    px-4 py-2 text-sm cursor-pointer transition-all duration-150
                    ${
                      isSelected
                        ? "bg-red-600 text-white"
                        : isFocused
                          ? "bg-red-50 text-red-600"
                          : "text-gray-700"
                    }
                  `,
                placeholder: () => "text-gray-400",
                singleValue: () => "text-gray-700 font-medium",
                dropdownIndicator: ({ isFocused }) =>
                  `text-red-500 ${isFocused ? "rotate-180 transition-transform" : ""}`,
                indicatorSeparator: () => "bg-red-200",
              }}
            />
          </div>
        </div>
        {selectedCandidateId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
            <div
              className="
              relative
              group
              backdrop-blur-2xl
              bg-white/60
              border border-white/40
              shadow-[0_20px_50px_rgba(220,38,38,0.08)]
              rounded-3xl
              p-6
              overflow-hidden
              transition-all duration-300
              hover:shadow-[0_25px_60px_rgba(220,38,38,0.15)]
            "
            >
              <div className="absolute inset-0 bg-linear-to-br from-red-100/30 via-transparent to-red-50/30 pointer-events-none rounded-3xl" />

              <div
                className="
                relative
                backdrop-blur-2xl
                bg-white/60
                border border-white/40
                shadow-[0_15px_45px_rgba(220,38,38,0.08)]
                rounded-3xl
                p-6
                overflow-hidden
              "
              >
                <div className="absolute inset-0 bg-linear-to-br from-red-100/30 via-transparent to-red-50/30 pointer-events-none rounded-3xl" />

                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                      AI Analytics
                    </p>
                    <h3 className="text-2xl font-bold bg-linear-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                      AI Efficiency Breakdown
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div
                      className="
                      bg-white/70
                      backdrop-blur-xl
                      border border-white/40
                      rounded-2xl
                      px-6 py-4
                      min-w-35
                      text-center
                      shadow-sm
                      hover:shadow-md
                      transition-all duration-300
                    "
                    >
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        AI Accuracy
                      </p>
                      <p className="text-2xl font-bold text-red-600 mt-1">
                        {candidateReportQuery.data?.candidate.job_fit_score ||
                          0}
                        %
                      </p>
                    </div>
                    <div
                      className="
                      bg-white/70
                      backdrop-blur-xl
                      border border-white/40
                      rounded-2xl
                      px-6 py-4
                      min-w-60
                      text-left
                      shadow-sm
                      hover:shadow-md
                      transition-all duration-300
                    "
                    >
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Recommendation
                      </p>
                      <p className="text-sm font-medium text-gray-700 mt-2 leading-relaxed">
                        {candidateReportQuery.data?.candidate
                          .skill_gaps_recommendations ||
                          "No recommendation available."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mb-6">
                <Bar data={efficiencyBarData} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold bg-linear-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                  HR Officer Reports
                </h2>
                <p className="text-sm text-gray-500">
                  Actual HR evaluations for the candidate
                </p>
              </div>

              <div
                className="
                flex gap-6
                overflow-x-auto
                pb-4
                scrollbar-thin
                scrollbar-thumb-red-300
              "
              >
                {hrReports.data?.map((report) => (
                  <HRReportCard key={report.id} report={report} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/30 bg-white/50 backdrop-blur-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Waiting for selection
            </p>
            <h3 className="mt-2 text-xl font-bold bg-linear-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
              Select a candidate to view reports
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Pick a candidate from the dropdown above to load specific AI
              analytics and HR evaluations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
