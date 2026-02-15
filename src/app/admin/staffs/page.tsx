"use client";

import { useState } from "react";
import { USER_ROLES } from "@/lib/constants";
import { trpc } from "@/lib/trpc/client";

type staffRole = "Admin" | "HR Officer";

export default function UsersPage() {
  const [searchInput, setSearchInput] = useState("");
  const usersQuery = trpc.admin.users.useQuery({
    searchQuery: searchInput || undefined,
  });
  const changeRoleMutation = trpc.admin.changeUserRole.useMutation();

  const handleRoleChange = async (userId: string, newRole: staffRole) =>
    await changeRoleMutation.mutateAsync(
      { userId, newRole },
      {
        onSuccess: () => {
          usersQuery.refetch();
        },
        onError: (error) => {
          alert(`Failed to change user role: ${error.message}`);
        },
      },
    );

  return (
    <div className="min-h-screen p-8 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-100 via-white to-red-50 opacity-40 pointer-events-none" />
      <div className="relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-600 bg-clip-text text-transparent">
            User Management
          </h2>

          <input
            type="text"
            placeholder="Search by Name or Role..."
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
                <th className="py-3 px-4 text-left">Role</th>
                <th className="py-3 px-4 text-center">User Roles</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {Array.isArray(usersQuery.data?.users) &&
              usersQuery.data.users.length > 0 ? (
                usersQuery.data.users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-medium">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 text-sm font-semibold rounded-full ${
                          user.role === "Admin"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value as staffRole)
                        }
                        className="border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:outline-none"
                      >
                        {USER_ROLES.filter((role) => role !== "SuperAdmin").map(
                          (role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ),
                        )}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center p-6 text-gray-500 italic"
                  >
                    No users found.
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
