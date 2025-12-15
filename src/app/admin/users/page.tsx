"use client";

import { useState, useMemo } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Interviewer" | "Applicant";
}

export default function UsersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "Admin",
    },
    {
      id: "2",
      name: "Bob Smith",
      email: "bob@example.com",
      role: "Interviewer",
    },
    {
      id: "3",
      name: "Charlie Brown",
      email: "charlie@example.com",
      role: "Applicant",
    },
    {
      id: "4",
      name: "Dana White",
      email: "dana@example.com",
      role: "Applicant",
    },
    {
      id: "5",
      name: "Eve Black",
      email: "eve@example.com",
      role: "Interviewer",
    },
  ]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const input = searchInput.toLowerCase();
      return (
        user.name.toLowerCase().includes(input) ||
        user.role.toLowerCase().includes(input)
      );
    });
  }, [searchInput, users]);

  const handleRoleChange = (userId: string, newRole: User["role"]) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-red-600 mb-4">User Management</h2>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by Name or Role..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-full md:w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none mb-4"
      />

      {/* Table */}
      <div className="overflow-x-auto max-h-[600px]">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-600 text-sm uppercase sticky top-0">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Role</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 font-medium">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        user.role === "Admin"
                          ? "bg-green-100 text-green-700"
                          : user.role === "Interviewer"
                          ? "bg-blue-100 text-blue-700"
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
                        handleRoleChange(
                          user.id,
                          e.target.value as User["role"]
                        )
                      }
                      className="border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:outline-none"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Interviewer">Interviewer</option>
                      <option value="Applicant">Applicant</option>
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
  );
}
