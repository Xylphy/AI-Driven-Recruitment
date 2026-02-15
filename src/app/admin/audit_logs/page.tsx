"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useRef, useState } from "react";
import { EVENT_TYPES } from "@/lib/constants";
import { formatDate } from "@/lib/library";
import { trpc } from "@/lib/trpc/client";
import type { UserActionEventType } from "@/types/types";

const PAGE_SIZE = 15;

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "All" | UserActionEventType
  >("All");
  const [fromDate, setFromDate] = useState<string | undefined>(undefined);
  const [toDate, setToDate] = useState<string | undefined>(undefined);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const auditLogsInfinite = trpc.admin.auditLogs.useInfiniteQuery(
    {
      query: searchQuery,
      category: categoryFilter,
      fromDate,
      toDate,
      limit: PAGE_SIZE,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    },
  );

  const rows = (auditLogsInfinite.data?.pages ?? []).flatMap(
    (p) => p.auditLogs ?? [],
  );

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          auditLogsInfinite.hasNextPage &&
          !auditLogsInfinite.isFetchingNextPage
        ) {
          auditLogsInfinite.fetchNextPage();
        }
      });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [auditLogsInfinite]);

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    doc.text("Audit Logs Report", 14, 16);

    const tableColumn = ["Description", "Category", "Timestamp"];
    const tableRows: string[][] = [];

    rows.forEach((row) => {
      tableRows.push([row.details, row.event_type, formatDate(row.created_at)]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 22,
      headStyles: { fillColor: [220, 38, 38] },
    });

    doc.save("audit_logs_report.pdf");
  };

  return (
    <div className="min-h-screen p-8 space-y-6 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-100 via-white to-red-50 opacity-40 pointer-events-none" />

      <div className="relative z-10 space-y-10">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-600 bg-clip-text text-transparent">
            Audit Logs
          </h2>
        </div>

        <div className="rounded-3xl backdrop-blur-2xl bg-white/30 border border-white/20 shadow-2xl p-6 flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-5 py-2 rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 focus:ring-2 focus:ring-red-400 outline-none"
          />

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as "All" | UserActionEventType)
            }
            className="px-5 py-2 rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 focus:ring-2 focus:ring-red-400 outline-none"
          >
            <option value="All">All Categories</option>
            {EVENT_TYPES.map((eventType) => (
              <option key={eventType} value={eventType}>
                {eventType}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-5 py-2 rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 focus:ring-2 focus:ring-red-400 outline-none"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-5 py-2 rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 focus:ring-2 focus:ring-red-400 outline-none"
          />

          <button
            onClick={handleDownloadReport}
            className="ml-auto px-6 py-2 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold shadow-lg hover:scale-105 transition-all duration-300"
          >
            DOWNLOAD REPORT
          </button>
        </div>

        <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-red-50 text-red-600">
              <tr>
                <th className="p-5 text-left">Description</th>
                <th className="p-5 text-left">Event</th>
                <th className="p-5 text-left">Entity</th>
                <th className="p-5 text-left">Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-white/20 hover:bg-white/30 transition"
                  >
                    <td className="p-5 text-gray-800">{row.details}</td>

                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
                          ${
                            row.action === "create"
                              ? "bg-green-100 text-green-700"
                              : row.action === "update"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                      >
                        {row.event_type}
                      </span>
                    </td>

                    <td className="p-5 text-gray-600">{row.entity_type}</td>

                    <td className="p-5 text-gray-500">
                      {formatDate(row.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center p-10 italic text-gray-500"
                  >
                    No audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center items-center gap-4 mt-6">
          <div ref={loadMoreRef} aria-hidden className="h-2" />

          {auditLogsInfinite.isFetchingNextPage ? (
            <span className="text-sm text-gray-500">Loading more...</span>
          ) : auditLogsInfinite.hasNextPage ? (
            <button
              onClick={() => auditLogsInfinite.fetchNextPage()}
              className="px-6 py-2 rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 hover:bg-white/60 transition"
            >
              Load More
            </button>
          ) : (
            <span className="text-sm text-gray-400">No more logs</span>
          )}
        </div>
      </div>
    </div>
  );
}
