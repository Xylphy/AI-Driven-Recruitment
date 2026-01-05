"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { formatDate } from "@/lib/library";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { EVENT_TYPES } from "@/lib/constants";
import { UserActionEventType } from "@/types/types";

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
      fromDate: fromDate,
      toDate: toDate,
      limit: PAGE_SIZE,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }
  );

  const rows = (auditLogsInfinite.data?.pages ?? []).flatMap(
    (p) => p.auditLogs ?? []
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
  }, [
    auditLogsInfinite.hasNextPage,
    auditLogsInfinite.isFetchingNextPage,
    auditLogsInfinite.fetchNextPage,
  ]);

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    doc.text("Audit Logs Report", 14, 16);

    const tableColumn = ["Description", "Category", "Timestamp"];
    const tableRows: string[][] = [];

    if (Array.isArray(rows)) {
      rows.forEach((row) => {
        tableRows.push([
          row.details,
          row.event_type,
          formatDate(row.created_at),
        ]);
      });
    }

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 22,
    });

    doc.save("audit_logs_report.pdf");
  };
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
          onChange={(e) =>
            setCategoryFilter(e.target.value as "All" | UserActionEventType)
          }
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
        >
          <option value="All">All Categories</option>
          {EVENT_TYPES.map((eventType) => (
            <option key={eventType} value={eventType}>
              {eventType}
            </option>
          ))}
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

        <button
          onClick={handleDownloadReport}
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
              <th className="p-4 font-semibold border-b">Event</th>
              <th className="p-4 font-semibold border-b">Entity</th>
              <th className="p-4 font-semibold border-b">Timestamp</th>
            </tr>
          </thead>

          <tbody>
            {Array.isArray(rows) && rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  {/* Description */}
                  <td className="p-4 text-sm text-gray-800">{row.details}</td>

                  {/* Event Type */}
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                  ${
                    row.action === "create"
                      ? "bg-green-100 text-green-700"
                      : row.action === "update"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }
                `}
                    >
                      {row.event_type}
                    </span>
                  </td>

                  {/* Entity Type */}
                  <td className="p-4 text-sm text-gray-600">
                    {row.entity_type}
                  </td>

                  {/* Timestamp */}
                  <td className="p-4 text-sm text-gray-500">
                    {formatDate(row.created_at)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="text-center p-6 text-gray-500 italic"
                >
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-4 mt-4">
        <div ref={loadMoreRef} aria-hidden className="h-2" />
        {auditLogsInfinite.isFetchingNextPage ? (
          <span className="text-sm text-gray-500">Loading more...</span>
        ) : auditLogsInfinite.hasNextPage ? (
          <button
            onClick={() => auditLogsInfinite.fetchNextPage()}
            className="px-4 py-2 bg-gray-100 rounded"
          >
            Load more
          </button>
        ) : (
          <span className="text-sm text-gray-400">No more logs</span>
        )}
      </div>
    </div>
  );
}
