"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";

export default function HROfficersPage() {
  const [searchInput, setSearchInput] = useState("");

  const usersQuery = trpc.admin.users.useQuery({
    searchQuery: searchInput || undefined,
    role: "HR Officer",
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-red-600">
        HR Officers & Job Assignments
      </h2>

      <input
        type="text"
        placeholder="Search HR Officer by name or email..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-full md:w-1/2 px-4 py-2 border rounded-lg 
                   focus:ring-2 focus:ring-red-500 focus:outline-none"
      />

      <div className="overflow-x-auto max-h-150">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-600 text-sm uppercase sticky top-0">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Jobs Assigned</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {Array.isArray(usersQuery.data?.users) &&
            usersQuery.data.users.length > 0 ? (
              usersQuery.data.users.map((user) => (
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
                      {/* Placeholder pills */}
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                        Software Engineer
                      </span>
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                        UI/UX Designer
                      </span>
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                        Data Analyst
                      </span>
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
  );
}
