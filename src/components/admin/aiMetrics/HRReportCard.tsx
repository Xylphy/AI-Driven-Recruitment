"use client";

import { formatDate } from "@/lib/library";
import type { HRReport } from "@/types/types";

interface HRReportCardProps {
  report: HRReport;
}
export default function HRReportCard({ report }: HRReportCardProps) {
  return (
    <div
      className="
        relative
        bg-white/60
        backdrop-blur-2xl
        border border-white/40
        rounded-3xl
        shadow-[0_15px_40px_rgba(220,38,38,0.08)]
        p-6
        space-y-4
        min-w-85
      "
    >
      <div className="absolute inset-0 bg-linear-to-br from-red-100/30 via-transparent to-red-50/30 rounded-3xl pointer-events-none" />

      <div className="relative flex justify-between items-start">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500">
            HR Officer
          </p>
          <h3 className="text-lg font-semibold text-gray-800">
            {report.staff_name}
          </h3>
        </div>

        <div className="px-3 py-1 bg-red-600/10 text-red-600 text-sm font-semibold rounded-full">
          {report.score.toFixed(1)} / 5
        </div>
      </div>

      <div className="relative flex gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={`star-${report.id}-${i}`}
            className={`w-5 h-5 ${
              i < Math.round(report.score) ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <title>Star Rating</title>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.184 3.642a1 1 0 00.95.69h3.813c.969 0 1.371 1.24.588 1.81l-3.087 2.243a1 1 0 00-.364 1.118l1.184 3.642c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.087 2.243c-.785.57-1.84-.197-1.54-1.118l1.184-3.642a1 1 0 00-.364-1.118L3.106 9.07c-.783-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.184-3.642z" />
          </svg>
        ))}
      </div>

      <div className="relative">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
          Key Highlights
        </p>

        <div className="flex flex-wrap gap-2">
          {report.highlights.map((item, index) => (
            <span
              key={`${report.id}-highlight-${index}`}
              className="
                px-3 py-1.5 text-xs font-medium
                rounded-full
                bg-white/70 backdrop-blur-md
                border border-white/40
                text-gray-700
              "
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
          Summary
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          {report.summary}
        </p>
      </div>

      <div className="relative text-xs text-gray-400 pt-2 border-t border-white/30">
        Submitted on {formatDate(report.created_at)}
      </div>
    </div>
  );
}
