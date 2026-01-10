"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { MdAccessTime, MdChevronRight, MdLocationOn } from "react-icons/md";
import useAuth from "@/hooks/useAuth";
import { formatDate } from "@/lib/library";
import { swalConfirm, swalError, swalSuccess } from "@/lib/swal";
import { trpc } from "@/lib/trpc/client";

type UIState = {
	showDeleteModal: boolean;
	isDeleting: boolean;
	isApplying: boolean;
	isNotifying: boolean;
};

type JobDetail = {
	title: string;
	requirements: string[];
	qualifications: string[];
	tags: string[];
	created_at: string;
	is_fulltime: boolean;
	location: string;
};

export default function Page() {
	const router = useRouter();
	const jobId = useParams().id as string;
	const [showSkillModal, setShowSkillModal] = useState(false);

	const { isAuthenticated } = useAuth({
		routerActivation: false,
	});
	const [states, setStates] = useState<UIState>({
		showDeleteModal: false,
		isDeleting: false,
		isApplying: false,
		isNotifying: false,
	});

	const jobDetailsUser = trpc.joblisting.getJobDetails.useQuery({ jobId });

	const jobDetailsStaff = trpc.staff.getJobDetails.useQuery(
		{ jobId },
		{
			enabled: isAuthenticated,
		},
	);

	const jobDetails: JobDetail | undefined = isAuthenticated
		? jobDetailsStaff.data
		: jobDetailsUser.data;

	const applyJobMutation = trpc.joblisting.applyForJob.useMutation();
	const deleteJobMutation = trpc.joblisting.deleteJoblisting.useMutation();

	const handleApply = async () => {
		setStates((prev) => ({ ...prev, isApplying: true }));

		await applyJobMutation.mutateAsync(
			{ jobId },
			{
				onSuccess() {
					swalSuccess(
						"Application Submitted",
						"Your application was sent successfully.",
					);
					jobDetailsUser.refetch();
				},
				onError(error) {
					swalError("Application Failed", error.message);
				},
				onSettled() {
					setStates((prev) => ({ ...prev, isApplying: false }));
				},
			},
		);
	};

	const handleDeleteJob = async () => {
		swalConfirm(
			"Delete Job Listing?",
			"This action cannot be undone.",
			async () => {
				setStates((prev) => ({ ...prev, isDeleting: true }));

				try {
					await deleteJobMutation.mutateAsync({
						joblistingId: jobId,
						officer_id: jobDetailsUser.data?.officer_id || "",
					});

					swalSuccess("Deleted", "Job listing deleted successfully", () => {
						router.push("/admin");
					});
				} catch (error: unknown) {
					swalError(
						"Delete Failed",
						typeof error === "object" && error !== null && "message" in error
							? String((error as { message?: unknown }).message)
							: "An unexpected error occurred",
					);
				} finally {
					setStates((prev) => ({
						...prev,
						isDeleting: false,
						showDeleteModal: false,
					}));
				}
			},
		);
	};

	if (!jobDetails) {
		return (
			<main className="bg-white min-h-screen py-5 px-4 md:px-20">
				<div className="max-w-4xl mx-auto animate-pulse">
					<div className="h-44 bg-gray-200 rounded mb-6" />
					<div className="flex flex-col lg:flex-row gap-6">
						<div className="w-full lg:w-2/3 p-8">
							<div className="h-6 bg-gray-200 rounded mb-4 w-1/3" />
							<div className="space-y-3">
								<div className="h-4 bg-gray-200 rounded w-full" />
								<div className="h-4 bg-gray-200 rounded w-full" />
								<div className="h-4 bg-gray-200 rounded w-5/6" />
							</div>
						</div>
						<div className="w-full lg:w-1/3 bg-gray-50 border-l p-6">
							<div className="h-6 bg-gray-200 rounded mb-4 w-1/2" />
							<div className="space-y-3">
								<div className="h-4 bg-gray-200 rounded w-full" />
								<div className="h-4 bg-gray-200 rounded w-3/4" />
								<div className="h-10 bg-gray-200 rounded w-full mt-6" />
							</div>
						</div>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="bg-white min-h-screen py-5 px-4 md:px-20">
			{states.showDeleteModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
						<h3 className="text-lg font-bold text-gray-800 mb-4">
							Confirm Delete
						</h3>
						<p className="text-gray-600 mb-6">
							Are you sure you want to delete this job listing? This action
							cannot be undone.
						</p>
						<div className="flex gap-3 justify-end">
							<button
								className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
								disabled={states.isDeleting}
								onClick={() =>
									setStates((prev) => ({ ...prev, showDeleteModal: false }))
								}
								type="button"
							>
								Cancel
							</button>
							<button
								className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
								disabled={states.isDeleting}
								onClick={handleDeleteJob}
								type="button"
							>
								{states.isDeleting ? "Deleting..." : "Delete"}
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="max-w-4xl mx-auto">
				<div className="relative h-44">
					<Image
						src="/workspace.jpg"
						alt="Header Background"
						fill
						className="object-cover"
						priority
					/>
					<div className="absolute inset-0 bg-black/75 z-10" />
					<div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
						<h1 className="text-3xl font-bold text-center text-white">
							{jobDetails.title}
						</h1>
						<hr className="w-1/2 mx-auto border-t border-red-600 my-2" />
						<div className="flex justify-center mt-2 space-x-4 text-white font-medium text-sm">
							<span className="flex items-center gap-1">
								<MdLocationOn className="text-red-600" /> {jobDetails.location}
							</span>
							<span className="flex items-center gap-1">
								<MdAccessTime className="text-red-600" />{" "}
								{jobDetails.is_fulltime ? "Full-Time" : "Part-Time"}
							</span>
						</div>
					</div>
				</div>
				<div className="flex flex-col lg:flex-row py-5">
					<div className="w-full lg:w-2/3 p-8">
						<section className="mb-8">
							<h2 className="text-2xl font-bold text-red-600 mb-4">
								Qualifications
							</h2>
							<ul className="space-y-2 text-gray-700 text-sm">
								{jobDetails.qualifications.map((item) => (
									<li
										key={crypto.randomUUID()}
										className="flex items-start gap-2"
									>
										<MdChevronRight className="text-red-600 mt-1" />
										<span>{item}</span>
									</li>
								))}
							</ul>
						</section>

						<section>
							<h2 className="text-2xl font-bold text-red-600 mb-4">
								Requirements
							</h2>
							<ul className="space-y-2 text-gray-700 text-sm">
								{jobDetails.requirements.map((item) => (
									<li
										key={crypto.randomUUID()}
										className="flex items-start gap-2"
									>
										<MdChevronRight className="text-red-600 mt-1" />
										<span>{item}</span>
									</li>
								))}
							</ul>
						</section>

						<section className="mt-8">
							<h2 className="text-2xl font-bold text-red-600 mb-4">Tags</h2>
							<ul className="space-y-2 text-gray-700 text-sm">
								{jobDetails.tags.map((tag) => (
									<li
										key={crypto.randomUUID()}
										className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm mr-2 mb-2"
									>
										{tag}
									</li>
								))}
							</ul>
						</section>
					</div>

					<div className="w-full lg:w-1/3 bg-gray-50 border-l p-6">
						<section className="mb-8">
							<h3 className="text-xl font-bold text-gray-800 mb-2">
								Job Summary
							</h3>
							<ul className="text-sm text-gray-700 space-y-1">
								<li>
									<strong>Published:</strong>{" "}
									{formatDate(jobDetails.created_at)}
								</li>
								<li>
									<strong>Job Nature:</strong>{" "}
									{jobDetails.is_fulltime ? "Full-Time" : "Part-Time"}
								</li>
								<li>
									<strong>Location:</strong> {jobDetails.location}
								</li>
							</ul>
						</section>

						<section>
							<h3 className="text-xl font-bold text-gray-800 mb-2">
								Company Detail
							</h3>
							<p className="text-sm text-gray-700">
								Alliance Software, Inc. is a global IT services and solutions
								company. Established in 2000, Alliance has grown to become one
								of the Philippines’ largest and most respected independent
								software development companies.
							</p>
						</section>

						{isAuthenticated && (
							<>
								<button
									className="mt-6 w-full bg-red-600 text-white font-bold py-2 rounded border border-transparent hover:bg-transparent hover:text-red-600 hover:border-red-600"
									onClick={() => router.push(`/candidates/${jobId}`)}
									type="button"
								>
									See Applicants
								</button>
								<button
									className="mt-2 w-full bg-red-600 text-white font-bold py-2 rounded border border-transparent hover:bg-transparent hover:text-red-600 hover:border-red-600"
									onClick={() =>
										setStates((prev) => ({
											...prev,
											showDeleteModal: true,
										}))
									}
									type="button"
								>
									Delete Job
								</button>
								<button
									className="mt-2 w-full bg-red-600 text-white font-bold py-2 rounded border border-transparent hover:bg-transparent hover:text-red-600 hover:border-red-600"
									onClick={() => router.push(`/joblisting/${jobId}/edit`)}
									type="button"
								>
									Edit Job
								</button>
							</>
						)}
						<button
							className={`mt-2 w-full font-bold py-2 rounded border border-transparent transition-all duration-300 ease-in-out "bg-red-600 text-white hover:bg-transparent hover:text-red-600 hover:border-red-600"`}
							disabled={
								!!jobDetailsUser.data?.status ||
								states.isApplying ||
								jobDetailsUser.data?.isApplicant
							}
							onClick={() => setShowSkillModal(true)}
							type="button"
						>
							{jobDetailsUser.data?.status
								? jobDetailsUser.data.status
								: states.isApplying
									? "Applying..."
									: jobDetailsUser.data?.isApplicant
										? "To be reviewed"
										: "Apply Job"}
						</button>

						{showSkillModal && (
							<div className="fixed inset-0 z-50 flex items-center justify-center">
								<button
									type="button"
									aria-label="Close skill self-assessment modal"
									className="absolute inset-0 bg-white/40 backdrop-blur-sm"
									onClick={() => setShowSkillModal(false)}
								/>

								<div className="relative w-full max-w-2xl mx-4 rounded-2xl border border-white/30 bg-white/30 backdrop-blur-xl shadow-2xl p-6">
									<div className="absolute inset-0 rounded-2xl bg-linear-to-br from-red-500/10 via-transparent to-black/10 pointer-events-none" />

									<div className="relative">
										<div className="flex justify-between items-center mb-4">
											<h2 className="text-2xl font-bold text-red-600">
												Skill Self-Assessment
											</h2>
											<button
												onClick={() => setShowSkillModal(false)}
												className="text-gray-500 hover:text-red-600 text-xl"
												type="button"
											>
												✕
											</button>
										</div>

										<p className="text-sm text-gray-600 mb-6">
											Please rate your proficiency in the following skills
											before continuing.
										</p>

										<div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
											{[
												"JavaScript",
												"React",
												"System Design",
												"Problem Solving",
												"Communication Skills",
											].map((skill) => (
												<div
													key={crypto.randomUUID()}
													className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-md border border-white/40"
												>
													<div>
														<p className="font-semibold text-gray-800">
															{skill}
														</p>
														<p className="text-xs text-gray-500">
															Rate from 1 (Beginner) to 5 (Expert)
														</p>
													</div>

													{/* Rating Buttons */}
													<div className="flex gap-2">
														{[1, 2, 3, 4, 5].map((num) => (
															<button
																key={num}
																type="button"
																className="w-9 h-9 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 bg-white/70 hover:bg-red-600 hover:text-white hover:border-red-600 transition"
															>
																{num}
															</button>
														))}
													</div>
												</div>
											))}
										</div>

										<div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
											<button
												className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
												onClick={() => setShowSkillModal(false)}
												type="button"
											>
												Cancel
											</button>

											<button
												className="px-6 py-2 rounded-lg bg-linear-to-r from-red-600 to-red-500 text-white font-bold"
												onClick={() => {
													setShowSkillModal(false);
													handleApply();
												}}
												type="button"
											>
												Continue Application
											</button>
										</div>
									</div>
								</div>
							</div>
						)}

						<button
							className="mt-2 w-full bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-gray-500 hover:border-gray-500"
							onClick={() => router.back()}
							type="button"
						>
							Back
						</button>
					</div>
				</div>
			</div>
		</main>
	);
}
