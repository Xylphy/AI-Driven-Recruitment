"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

export default function Careers() {
	const router = useRouter();
	const jobsQuery = trpc.joblisting.fetchJobs.useQuery({});
	const [jobTitle, setJobTitle] = useState("");
	const filteredJobs = jobsQuery.data?.jobs.filter((job) => {
		const matchesTitle = job.title
			.toLowerCase()
			.includes(jobTitle.toLowerCase());

		return matchesTitle;
	});

	if (jobsQuery.isLoading) {
		return (
			<div className="text-gray-800" aria-busy="true">
				{/* Hero skeleton */}
				<section className="relative w-full h-75 bg-gray-200 flex items-center justify-center">
					<div className="absolute inset-0 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
					<div className="relative z-10 w-3/4 max-w-4xl text-center">
						<div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-4"></div>
						<div className="h-3 bg-gray-300 rounded w-2/3 mx-auto"></div>
					</div>
				</section>

				{/* Main layout skeleton */}
				<section className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Filters skeleton */}
					<div className="space-y-4 px-5 border-r">
						<div className="h-10 bg-gray-200 rounded w-full"></div>
						<div className="h-10 bg-gray-200 rounded w-full"></div>
						<div className="h-10 bg-gray-200 rounded w-1/2"></div>
					</div>

					{/* Job list skeleton */}
					<div className="md:col-span-2 space-y-4 overflow-hidden max-h-125 pr-2">
						{Array.from({ length: 6 }).map((_, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-white"
							>
								<div className="flex-1 space-y-3">
									<div className="h-4 bg-gray-200 rounded w-3/5"></div>
									<div className="flex items-center space-x-2">
										<div className="h-3 bg-gray-200 rounded w-24"></div>
										<div className="h-3 bg-gray-200 rounded w-16"></div>
									</div>
								</div>
								<div className="ml-4 h-8 w-20 bg-gray-200 rounded"></div>
							</div>
						))}
					</div>
				</section>

				{/* Activities/Benefits placeholders */}
				<section className="bg-gray-50 py-10">
					<div className="max-w-6xl mx-auto px-6">
						<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
							{Array.from({ length: 5 }).map((_, i) => (
								<div
									key={i}
									className="bg-white rounded-md shadow p-4 text-center"
								>
									<div className="h-24 bg-gray-200 rounded mb-2 animate-pulse"></div>
									<div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
								</div>
							))}
						</div>
					</div>
				</section>
			</div>
		);
	}

	return (
		<div className="text-gray-800">
			<section
				className="relative w-full h-75 bg-cover bg-center"
				style={{ backgroundImage: "url('/workspace.jpg')" }}
			>
				<div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
					<h1 className="text-white text-4xl sm:text-5xl font-bold">CAREERS</h1>
					<hr className="w-1/4 mx-auto border-t border-red-600 my-1" />
					<p className="text-white max-w-3xl text-center">
						Alliance Software, Inc. is the Philippines’ largest independent
						Filipino software development and business solutions company.
					</p>
				</div>
			</section>

			<section className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="space-y-4 px-5 border-r">
					<input
						type="text"
						placeholder="Job Title"
						value={jobTitle}
						onChange={(e) => setJobTitle(e.target.value)}
						className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
					/>
					<button
						type="button"
						onClick={(e) => e.preventDefault()}
						className="bg-[#E30022] text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
					>
						Search
					</button>
				</div>

				<div className="md:col-span-2 space-y-4 overflow-y-auto max-h-125 pr-2">
					{filteredJobs?.map((job, index) => (
						<div
							key={index}
							className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:shadow"
							onClick={() => router.push(`/joblisting/${job.id}`)}
						>
							<div>
								<h3 className="text-lg font-bold">{job.title}</h3>
								<div className="text-sm text-gray-600 flex items-center space-x-2">
									<span>📍 {job.location}</span>
									<span>•</span>
									<span>{job.is_fulltime ? "Full-time" : "Part-time"}</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</section>

			<section className="bg-gray-50 py-10">
				<div className="max-w-6xl mx-auto px-6">
					<h2 className="text-2xl font-bold mb-6 text-red-600 text-center">
						Company <span className="text-black">Activities</span>
					</h2>
					<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
						{Array(5)
							.fill(0)
							.map((_, index) => (
								<div
									key={index}
									className="bg-white rounded-md shadow p-4 text-center"
								>
									<div className="h-24 bg-gray-200 rounded mb-2"></div>
									<p className="text-sm font-medium">Activity Name</p>
								</div>
							))}
					</div>
				</div>
			</section>

			{/* Company Benefits */}
			<section className="bg-white py-10">
				<div className="max-w-6xl mx-auto px-6">
					<h2 className="text-2xl font-bold mb-6 text-red-600 text-center">
						Company <span className="text-black">Benefits</span>
					</h2>
					<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
						{Array(5)
							.fill(0)
							.map((_, index) => (
								<div
									key={index}
									className="bg-white rounded-md shadow p-4 text-center"
								>
									<div className="h-24 bg-gray-200 rounded mb-2"></div>
									<p className="text-sm font-medium">Benefit Name</p>
								</div>
							))}
					</div>
				</div>
			</section>
		</div>
	);
}
