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
		<div className="bg-white p-6 rounded-lg shadow-md space-y-6">
			<h2 className="text-2xl font-bold text-red-600 mb-4">User Management</h2>

			<input
				type="text"
				placeholder="Search by Name or Role..."
				value={searchInput}
				onChange={(e) => setSearchInput(e.target.value)}
				className="w-full md:w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none mb-4"
			/>

			<div className="overflow-x-auto max-h-150">
				<table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
					<thead className="bg-gray-100 text-gray-600 text-sm uppercase sticky top-0">
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
								<tr
									key={user.id}
									className="border-t hover:bg-gray-50 transition"
								>
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
	);
}
