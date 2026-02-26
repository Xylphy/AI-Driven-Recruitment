"use client";

import { useState } from "react";
import { treeifyError } from "zod";
import useAuth from "@/hooks/useAuth";
import { REGULAR_STAFF_ROLES } from "@/lib/constants";
import { addStaffSchema } from "@/lib/schemas";
import { trpc } from "@/lib/trpc/client";
import type { RegularStaffRoles } from "@/types/types";
import { swalSuccess, swalError, swalInfo } from "@/lib/swal";

export default function UsersPage() {
  const { isAuthenticated } = useAuth();
  const [searchInput, setSearchInput] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newStaffRole, setNewStaffRole] =
    useState<RegularStaffRoles>("HR Officer");
  const [staffFirstName, setStaffFirstName] = useState("");
  const [staffLastName, setStaffLastName] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffEmail, setStaffEmail] = useState("");

  const staffsQuery = trpc.admin.staffs.useQuery(
    {
      searchQuery: searchInput || undefined,
    },
    {
      enabled: isAuthenticated,
    },
  );

  const staffs = staffsQuery.data?.staffs || [];

  const addStaffMutation = trpc.admin.addStaff.useMutation();
  const changeRoleMutation = trpc.admin.changeStaffRole.useMutation();

  const {
    success: isStaffValid,
    error: staffError,
    data: staffData,
  } = addStaffSchema.safeParse({
    email: staffEmail.trim(),
    firstName: staffFirstName.trim(),
    lastName: staffLastName.trim(),
    role: newStaffRole,
    password: staffPassword,
  });

  const handleRoleChange = async (userId: string, newRole: RegularStaffRoles) =>
    await changeRoleMutation.mutateAsync(
      { userId, newRole },
      {
        onSuccess: () => {
          staffsQuery.refetch();
        },
        onError: (error) => {
          swalError(
            "Role Update Failed",
            `Failed to change user role: ${error.message}`,
          );
        },
      },
    );

  // ✅ Placeholder add (local only)
  const handleAddStaff = () => {
    if (!isStaffValid) {
      swalError("Validation Failed", staffError);
      return;
    }

    addStaffMutation.mutate(
      {
        email: staffData.email,
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        role: staffData.role,
        password: staffData.password,
      },
      {
        onSuccess: () => {
          swalSuccess("Staff Added", "Staff added successfully!", () => {
            staffsQuery.refetch();
            setIsAddOpen(false);
            setNewStaffRole("HR Officer");
            setStaffFirstName("");
            setStaffLastName("");
            setStaffEmail("");
            setStaffPassword("");
          });
        },
        onError: (error) => {
          swalError(
            "Add Staff Failed",
            error instanceof Error ? error.message : String(error),
          );
        },
      },
    );
  };

  return (
    <div className="min-h-screen p-8 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-red-100 via-white to-red-50 opacity-40 pointer-events-none" />

      <div className="relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold bg-linear-to-r from-red-600 to-red-600 bg-clip-text text-transparent">
              Staff Management
            </h2>

            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="
                px-5 py-2 rounded-2xl
                bg-linear-to-r from-red-600 to-red-500
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
              {staffs.length > 0 ? (
                staffs.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-medium">
                      {staff.first_name} {staff.last_name}
                    </td>

                    <td className="py-3 px-4">{staff.email}</td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 text-sm font-semibold rounded-full ${
                          staff.role === "Admin"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {staff.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <select
                        value={staff.role}
                        onChange={(e) =>
                          handleRoleChange(
                            staff.id,
                            e.target.value as RegularStaffRoles,
                          )
                        }
                        className="border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:outline-none"
                      >
                        {REGULAR_STAFF_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
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
                    No staffs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close modal"
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
                  Create a new staff profile
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
                <label
                  htmlFor="setNewStaffRole"
                  className="block text-sm font-semibold text-gray-800 mb-2"
                >
                  Staff Role
                </label>
                <select
                  id="setNewStaffRole"
                  value={newStaffRole}
                  onChange={(e) =>
                    setNewStaffRole(e.target.value as RegularStaffRoles)
                  }
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
                  {REGULAR_STAFF_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="staffFirstName"
                  className="block text-sm font-semibold text-gray-800 mb-2"
                >
                  First Name
                </label>
                <input
                  id="staffFirstName"
                  value={staffFirstName}
                  onChange={(e) => setStaffFirstName(e.target.value)}
                  placeholder="e.g., Jane"
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
                <label
                  htmlFor="staffLastName"
                  className="block text-sm font-semibold text-gray-800 mb-2"
                >
                  Last Name
                </label>
                <input
                  id="staffLastName"
                  value={staffLastName}
                  onChange={(e) => setStaffLastName(e.target.value)}
                  placeholder="e.g., Doe"
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
                <label
                  htmlFor="setNewStaffEmail"
                  className="block text-sm font-semibold text-gray-800 mb-2"
                >
                  Email
                </label>
                <input
                  id="setNewStaffEmail"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
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

              <div>
                <label
                  htmlFor="setNewStaffPassword"
                  className="block text-sm font-semibold text-gray-800 mb-2"
                >
                  Password
                </label>
                <input
                  id="setNewStaffPassword"
                  type="password"
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
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="Enter a strong password"
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
                disabled={!isStaffValid}
                className="
                  px-6 py-2 rounded-2xl
                  bg-linear-to-r from-red-600 to-red-500
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
