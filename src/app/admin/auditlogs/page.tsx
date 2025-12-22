"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { formatDate } from "@/lib/library";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { USER_ACTION_EVENT_TYPES } from "@/lib/constants";
import { UserActionEventType } from "@/types/types";

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "All" | UserActionEventType
  >("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const auditLogsQuery = trpc.admin.auditLogs.useQuery({
    query: searchQuery,
    category: categoryFilter,
    fromDate: fromDate,
    toDate: toDate,
  });

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    doc.text("Audit Logs Report", 14, 16);

    const tableColumn = ["Description", "Category", "Timestamp"];
    const tableRows: string[][] = [];

    if (Array.isArray(auditLogsQuery.data?.auditLogs)) {
      auditLogsQuery.data.auditLogs.forEach((row) => {
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
          {USER_ACTION_EVENT_TYPES.map((eventType) => (
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
            {Array.isArray(auditLogsQuery.data?.auditLogs) &&
            auditLogsQuery.data.auditLogs.length > 0 ? (
              auditLogsQuery.data.auditLogs.map((row) => (
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
    </div>
  );
}
