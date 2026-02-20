"use client";

import { useMemo, useState } from "react";
import { USER_ROLES } from "@/lib/constants";
import { trpc } from "@/lib/trpc/client";

type staffRole = "Admin" | "HR Officer";

export default function UsersPage() {
  const [searchInput, setSearchInput] = useState("");

  // ✅ Add Staff modal state (PLACEHOLDER ONLY - no trpc create yet)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newStaffRole, setNewStaffRole] = useState<staffRole>("HR Officer");
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [localStaff, setLocalStaff] = useState<any[]>([]);

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

  const canAdd = useMemo(() => {
    return newStaffName.trim().length > 0 && newStaffEmail.trim().length > 0;
  }, [newStaffName, newStaffEmail]);

  // ✅ Placeholder add (local only)
  const handleAddStaff = () => {
    if (!canAdd) return;

    const name = newStaffName.trim().replace(/\s+/g, " ");
    const parts = name.split(" ");
    const first_name = parts[0] ?? "";
    const last_name = parts.slice(1).join(" ") || "";

    setLocalStaff((prev) => [
      {
        id: crypto.randomUUID(),
        first_name,
        last_name,
        email: newStaffEmail.trim(),
        role: newStaffRole,
      },
      ...prev,
    ]);

    setNewStaffRole("HR Officer");
    setNewStaffName("");
    setNewStaffEmail("");
    setIsAddOpen(false);
  };

  // Combine backend users + placeholder local staff
  const combinedUsers = useMemo(() => {
    const backendUsers = Array.isArray(usersQuery.data?.users)
      ? usersQuery.data.users
      : [];
    return [...localStaff, ...backendUsers];
  }, [localStaff, usersQuery.data?.users]);

  return (
    <div className="min-h-screen p-8 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-100 via-white to-red-50 opacity-40 pointer-events-none" />

      <div className="relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-600 bg-clip-text text-transparent">
              Staff Management
            </h2>

            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="
                px-5 py-2 rounded-2xl
                bg-gradient-to-r from-red-600 to-red-500
                text-white font-semibold
                shadow-md
                hover:scale-[1.02]
                transition
              "
            >
              Add Staff
            </button>
          </div>

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
              {combinedUsers.length > 0 ? (
                combinedUsers.map((user) => (
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
                        // optional: disable role change for locally-added placeholder items
                        disabled={localStaff.some((s) => s.id === user.id)}
                        title={
                          localStaff.some((s) => s.id === user.id)
                            ? "Placeholder row (wire create endpoint to enable)"
                            : ""
                        }
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

      {isAddOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsAddOpen(false)}
          />

          <div
            className="
              relative w-full max-w-lg
              rounded-3xl
              bg-white/70 backdrop-blur-2xl
              border border-white/40
              shadow-[0_25px_80px_rgba(0,0,0,0.18)]
              p-6
            "
            role="dialog"
            aria-modal="true"
            aria-label="Add Staff"
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Add Staff</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Create a new staff profile (placeholder only for now).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-3 py-1 rounded-xl bg-white/60 border border-white/40 text-gray-700 hover:bg-white/80 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Staff Role
                </label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as staffRole)}
                  className="
                    w-full
                    px-4 py-3
                    rounded-2xl
                    bg-white/60
                    border border-white/40
                    backdrop-blur-xl
                    shadow-inner
                    focus:outline-none
                    focus:ring-2 focus:ring-red-400/50
                  "
                >
                  <option value="HR Officer">HR Officer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Name
                </label>
                <input
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g., Jane Doe"
                  className="
                    w-full
                    px-4 py-3
                    rounded-2xl
                    bg-white/60
                    border border-white/40
                    backdrop-blur-xl
                    shadow-inner
                    focus:outline-none
                    focus:ring-2 focus:ring-red-400/50
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Email
                </label>
                <input
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="e.g., jane@company.com"
                  type="email"
                  className="
                    w-full
                    px-4 py-3
                    rounded-2xl
                    bg-white/60
                    border border-white/40
                    backdrop-blur-xl
                    shadow-inner
                    focus:outline-none
                    focus:ring-2 focus:ring-red-400/50
                  "
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="
                  px-5 py-2 rounded-2xl
                  bg-white/60 border border-white/40
                  text-gray-800 font-semibold
                  hover:bg-white/80
                  transition
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAddStaff}
                disabled={!canAdd}
                className="
                  px-6 py-2 rounded-2xl
                  bg-gradient-to-r from-red-600 to-red-500
                  text-white font-semibold
                  shadow-md
                  hover:scale-[1.02]
                  transition-all
                  disabled:opacity-50 disabled:hover:scale-100
                "
              >
                Add Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
