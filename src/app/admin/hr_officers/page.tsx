"use client";

import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc/client";

export default function HROfficersPage() {
  const { isAuthenticated } = useAuth();
  const [searchInput, setSearchInput] = useState("");

  const hrOfficersQuery = trpc.admin.fetchHrOfficers.useQuery(
    {
      query: searchInput || undefined,
    },
    {
      enabled: isAuthenticated,
    },
  );

  return (
    <div className="min-h-screen p-8 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-red-100 via-white to-red-50 opacity-40 pointer-events-none" />
      <div className="relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-3xl font-bold bg-linear-to-r from-red-600 to-red-600 bg-clip-text text-transparent">
            HR Officers
          </h2>

          <input
            type="text"
            placeholder="Search HR Officer by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full md:w-80 px-5 py-2 rounded-2xl bg-white/40 border border-white/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-red-400 shadow-inner transition-al"
          />
        </div>

        <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-red-50 text-red-600">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Jobs Assigned</th>
              </tr>
            </thead>

            <tbody className="text-gray-700">
              {Array.isArray(hrOfficersQuery.data?.hrOfficers) &&
              hrOfficersQuery.data.hrOfficers.length > 0 ? (
                hrOfficersQuery.data.hrOfficers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 font-medium">
                      {user.first_name} {user.last_name}
                    </td>

                    <td className="py-3 px-4">{user.email}</td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        {user.jobsAssigned && user.jobsAssigned.length > 0 ? (
                          user.jobsAssigned.map((job) => (
                            <span
                              key={crypto.randomUUID()}
                              className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700"
                            >
                              {job}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 italic">
                            No jobs assigned
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center p-6 text-gray-500 italic"
                  >
                    No HR Officers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
