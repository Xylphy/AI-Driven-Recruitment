"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

export default function ApplicantsPage() {
	const router = useRouter();
	const [searchInput, setSearchInput] = useState("");
	const applicantsQuery = trpc.candidate.getCandidatesFromJob.useQuery({
		searchQuery: searchInput,
	});

	const filteredApplicants = applicantsQuery.data?.applicants || [];

	if (applicantsQuery.error) {
		return (
			<div className="p-6">
				<div className="flex items-start gap-4 bg-red-50 border border-red-100 p-4 rounded">
					<svg
						className="h-6 w-6 text-red-600"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M10 14l2-2m0 0l2-2m-2 2l2 2m-2-2l-2 2M12 6v6"
						/>
					</svg>
					<div>
						<p className="text-red-700 font-semibold">
							Failed to load candidates
						</p>
						<p className="mt-1 text-sm text-red-600">
							{applicantsQuery.error.message}
						</p>
						<div className="mt-3">
							<button
								onClick={() => router.refresh()}
								className="px-3 py-1 text-sm bg-[#E30022] text-white rounded hover:bg-red-700 transition"
								type="button"
							>
								Retry
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white p-6 rounded-lg shadow-md space-y-6">
			<h2 className="text-2xl font-bold text-red-600 mb-4">
				Candidate Management
			</h2>

			{/* Single Search Input */}
			<input
				type="text"
				placeholder="Search by Name, Job, or Status..."
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
							<th className="py-3 px-4 text-left">Job Applied</th>
							<th className="py-3 px-4 text-center">Status</th>
							<th className="py-3 px-4 text-center">Job Match Score</th>
							<th className="py-3 px-4 text-center">Action</th>
						</tr>
					</thead>
					<tbody className="text-gray-700">
						{applicantsQuery.isLoading ? (
							[0, 1, 2].map((i) => (
								<tr key={i}>
									<td className="p-4">
										<div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
									</td>
									<td className="p-4">
										<div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
									</td>
									<td className="p-4">
										<div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
									</td>
								</tr>
							))
						) : filteredApplicants.length > 0 ? (
							filteredApplicants.map((candidate) => (
								<tr
									key={crypto.randomUUID()}
									className="border-t hover:bg-gray-50 transition"
								>
									<td className="py-3 px-4 font-medium">{candidate.name}</td>
									<td className="py-3 px-4">{candidate.jobTitle}</td>
									<td className="py-3 px-4 text-center">
										<span
											className={`px-3 py-1 text-sm font-semibold rounded-full ${
												candidate.status === "Paper Screening"
													? "bg-green-100 text-green-700"
													: candidate.status === "Close Status"
														? "bg-yellow-100 text-yellow-700"
														: candidate.status === "Exam"
															? "bg-blue-100 text-blue-700"
															: "bg-gray-100 text-gray-700"
											}`}
										>
											{candidate.status || "Pending"}
										</span>
									</td>
									<td className="py-3 px-4 text-center font-semibold">
										<span
											className={`${
												candidate.predictiveSuccess >= 85
													? "text-green-600"
													: candidate.predictiveSuccess >= 70
														? "text-yellow-600"
														: "text-red-600"
											}`}
										>
											{candidate.predictiveSuccess}%
										</span>
									</td>
									<td className="py-3 px-4 text-center">
										<div className="flex justify-center gap-2">
											{/* View Profile */}
											<button
												className="px-3 py-1 text-sm bg-[#E30022] text-white rounded hover:bg-red-700 transition"
												onClick={() =>
													router.push(`/candidateprofile/${candidate.id}`)
												}
												type="button"
											>
												View
											</button>

											<button
												className="px-3 py-1 text-sm border border-[#E30022] text-[#E30022] rounded hover:bg-red-50 transition"
												type="button"
											>
												Compare
											</button>

											<a
												href={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload/${candidate.resumeId}`}
												target="_blank"
												rel="noopener noreferrer"
												className="px-3 py-1 text-sm border border-[#E30022] text-[#E30022] rounded hover:bg-red-50 transition"
											>
												Download Resume
											</a>
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={6}
									className="text-center p-6 text-gray-500 italic"
								>
									No candidates found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
