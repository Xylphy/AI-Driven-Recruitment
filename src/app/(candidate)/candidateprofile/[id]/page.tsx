"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { MdArrowBack, MdEmail, MdPhone } from "react-icons/md";
import {
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	ResponsiveContainer,
} from "recharts";
import Swal from "sweetalert2";
import HRReport from "@/components/admin/candidateProfile/HRReport";
import useAuth from "@/hooks/useAuth";
import { CANDIDATE_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/library";
import { trpc } from "@/lib/trpc/client";

type CandidateStatus = (typeof CANDIDATE_STATUSES)[number];

const CandidateProfile = dynamic(
	() => import("@/components/admin/candidateProfile/CandidateProfile"),
	{ ssr: false },
);

const CandidateResume = dynamic(
	() => import("@/components/admin/candidateProfile/CandidateResume"),
	{ ssr: false },
);
const glassCard =
	"bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl rounded-2xl";

const INTERVIEW_STATUSES: CandidateStatus[] = [
	"Exam",
	"HR Interview",
	"Technical Interview",
	"Final Interview",
];

export const languageRadarData = [
	{ language: "JavaScript", level: 88 },
	{ language: "TypeScript", level: 82 },
	{ language: "Python", level: 76 },
	{ language: "Java", level: 65 },
	{ language: "C++", level: 58 },
];

export default function Page() {
	const router = useRouter();
	const candidateId = useParams().id as string;
	const { isAuthenticated } = useAuth();
	const [selectedStatus, setSelectedStatus] = useState<CandidateStatus | null>(
		null,
	);
	const [activeTab, setActiveTab] = useState<"evaluation" | "resume">(
		"evaluation",
	);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [showScheduleModal, setShowScheduleModal] = useState(false);
	const [pendingStatus, setPendingStatus] = useState<CandidateStatus | null>(
		null,
	);

	const [scheduleData, setScheduleData] = useState({
		date: "",
		time: "",
		location: "",
	});
	// New: edit form state
	const [editScore, setEditScore] = useState<number>(0);
	const [editHighlights, setEditHighlights] = useState<string>("");
	const [editSummary, setEditSummary] = useState<string>("");

	const userJWT = trpc.auth.decodeJWT.useQuery(undefined, {
		enabled: isAuthenticated,
	});

	const { id: userId } = userJWT.data?.user || {};

	const candidateProfileQuery = trpc.candidate.fetchCandidateProfile.useQuery(
		{
			candidateId,
			fetchScore: true,
			fetchTranscribed: true,
			fetchResume: true,
		},
		{ enabled: isAuthenticated },
	);

	const updateCandidateStatusMutation =
		trpc.candidate.updateCandidateStatus.useMutation();

	const createHRReportMutation = trpc.staff.postHrReport.useMutation();
	const getHRReportsQuery = trpc.staff.fetchHRReports.useQuery(
		{ applicantId: candidateId },
		{
			enabled: isAuthenticated,
		},
	);
	const deleteHRReportMutation = trpc.hrOfficer.deleteHRReport.useMutation();
	const updateHRReportMutation = trpc.hrOfficer.editHRReport.useMutation();

	const hrReportsData = useMemo(
		() => getHRReportsQuery.data ?? [],
		[getHRReportsQuery.data],
	);

	const editingReport = useMemo(() => {
		if (editingIndex === null) return null;
		return hrReportsData[editingIndex] ?? null;
	}, [editingIndex, hrReportsData]);

	useEffect(() => {
		if (!editingReport) return;

		startTransition(() => {
			setEditScore(
				typeof editingReport.score === "number" ? editingReport.score : 0,
			);
			setEditHighlights(
				Array.isArray(editingReport.highlights)
					? editingReport.highlights.join(", ")
					: String(editingReport.highlights ?? ""),
			);
			setEditSummary(String(editingReport.summary ?? ""));
		});
	}, [editingReport]);

	useEffect(() => {
		startTransition(() =>
			setSelectedStatus(candidateProfileQuery.data?.status ?? null),
		);
	}, [candidateProfileQuery.data?.status]);

	const handleStatusChange = async (
		e: React.ChangeEvent<HTMLSelectElement>,
	) => {
		const newStatus = e.target.value as CandidateStatus | null;

		if (!newStatus) return;

		if (INTERVIEW_STATUSES.includes(newStatus)) {
			setPendingStatus(newStatus);
			setShowScheduleModal(true);
			return;
		}

		try {
			await updateCandidateStatusMutation.mutateAsync({
				applicantId: candidateId,
				newStatus,
			});

			Swal.fire({
				icon: "success",
				title: "Status Updated",
				text: `Candidate moved to ${newStatus}`,
				confirmButtonColor: "#E30022",
			});
		} catch (err) {
			Swal.fire({
				icon: "error",
				title: "Update failed",
				text: err instanceof Error ? err.message : "Something went wrong",
			});
		}
	};

	const candidate = candidateProfileQuery.data;

	const handleDeleteReport = (reportId: string) => {
		if (confirm("Are you sure you want to delete this HR evaluation?")) {
			deleteHRReportMutation.mutate(
				{ reportId, staffId: getHRReportsQuery.data?.[0]?.staff_id || "" },
				{
					onSuccess: () => {
						alert("HR evaluation deleted successfully.");
						getHRReportsQuery.refetch();
					},
					onError: (error: unknown) => {
						alert(error instanceof Error ? error.message : String(error));
					},
				},
			);
		}
	};

	const handleEditReport = (index: number) => {
		setEditingIndex(index);
	};

	const handleSaveEdit = () => {
		if (!editingReport) return;

		updateHRReportMutation.mutate(
			{
				reportId: editingReport.id,
				staffId: editingReport.staff_id,
				score: Number.isFinite(editScore) ? editScore : 0,
				keyHighlights: editHighlights,
				summary: editSummary,
			},
			{
				onSuccess: () => {
					alert("HR evaluation updated successfully.");
					setEditingIndex(null);
					getHRReportsQuery.refetch();
				},
				onError: (error: unknown) => {
					alert(error instanceof Error ? error.message : String(error));
				},
			},
		);
	};

	const handleCancelEdit = () => {
		setEditingIndex(null);
	};

	if (!isAuthenticated) {
		return (
			<main className="bg-linear-to-br from-red-50 via-white to-gray-100 min-h-screen flex items-center justify-center">
				<div className="bg-white/80 rounded-2xl shadow-xl px-8 py-12 flex flex-col items-center max-w-md w-full border border-red-100">
					<svg
						className="w-16 h-16 text-red-400 mb-6"
						fill="none"
						stroke="currentColor"
						strokeWidth={1.5}
						viewBox="0 0 24 24"
					>
						<title>Icon representing authentication required</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 11v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<h1 className="text-2xl font-bold text-gray-800 mb-2">
						Authentication Required
					</h1>
					<p className="text-gray-600 mb-6 text-center">
						You must be logged in to view this candidate profile.
					</p>
					<button
						onClick={() => router.push("/login")}
						className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
						type="button"
					>
						Go to Login
					</button>
				</div>
			</main>
		);
	}

	return (
		<main className="bg-gray-50 min-h-screen p-6">
			<div className="container mx-auto max-w-6xl space-y-6">
				<button
					onClick={() => router.back()}
					className="flex items-center gap-2 text-gray-600 hover:text-red-600 cursor-pointer"
					type="button"
				>
					<MdArrowBack className="text-xl" />
					<span>Back to Candidate List</span>
				</button>
				<div className={`${glassCard} p-6 flex flex-col items-center gap-4`}>
					<div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-red-500/30">
						<Image
							src="/logo.png"
							alt="Profile"
							width={128}
							height={128}
							className="object-cover w-full h-full"
						/>
					</div>

					<h2 className="text-2xl font-bold text-gray-800">
						{candidate
							? `${candidate.user.firstName} ${candidate.user.lastName}`
							: "Loading..."}
					</h2>

					<div className="flex gap-4 text-red-600">
						<MdEmail className="w-6 h-6" />
						<FaFacebook className="w-5 h-5" />
						<FaInstagram className="w-5 h-5" />
						<MdPhone className="w-6 h-6" />
					</div>

					<div className="w-full max-w-sm">
						<div className="flex justify-center mt-4">
							<select
								value={selectedStatus || ""}
								onChange={handleStatusChange}
								className="bg-red-100 text-red-700 font-semibold px-3 py-1.5 rounded border border-red-200 transition-all hover:bg-red-200 hover:text-red-800 w-48 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
							>
								<option value="">Select Status</option>
								{CANDIDATE_STATUSES.map((status) => (
									<option key={status} value={status}>
										{status}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex justify-center gap-4 mb-6">
						<button
							className={`px-4 py-2 rounded font-semibold transition ${
								activeTab === "evaluation"
									? "bg-red-600 text-white"
									: "bg-gray-200 text-gray-700 hover:bg-gray-300"
							}`}
							onClick={() => setActiveTab("evaluation")}
							type="button"
						>
							Candidate Evaluation
						</button>
						<button
							className={`px-4 py-2 rounded font-semibold transition ${
								activeTab === "resume"
									? "bg-red-600 text-white"
									: "bg-gray-200 text-gray-700 hover:bg-gray-300"
							}`}
							onClick={() => setActiveTab("resume")}
							type="button"
						>
							Resume
						</button>
					</div>

					{activeTab === "evaluation" ? (
						<div className="grid md:grid-cols-2 gap-6">
							<div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full overflow-auto">
								<h3 className="font-semibold mb-2">AI Generated Report</h3>
								{candidateProfileQuery.data ? (
									<CandidateProfile
										candidateProfile={candidateProfileQuery.data}
									/>
								) : (
									<p className="text-gray-500 italic">Loading evaluation...</p>
								)}
							</div>

							<div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full flex flex-col gap-4">
								<h3 className="font-semibold mb-2">HR Officer Report</h3>
								<div className="w-full flex justify-center mb-4">
									<HRReport
										onSubmit={(data) => {
											createHRReportMutation.mutate(
												{
													...data,
													applicantId: candidateId,
												},
												{
													onSuccess: () => {
														getHRReportsQuery.refetch();
														alert("HR Report submitted successfully.");
													},
													onError: (error) => {
														alert(
															error instanceof Error
																? error.message
																: String(error),
														);
													},
												},
											);
										}}
									/>
								</div>
								{showScheduleModal && (
									<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
										<div className={`${glassCard} w-full max-w-md p-6`}>
											<h2 className="text-xl font-bold mb-4 text-gray-800">
												Schedule Details — {pendingStatus}
											</h2>

											<div className="space-y-4">
												<input
													type="date"
													className="w-full rounded-lg border border-white/40 bg-white/60 px-4 py-2 focus:outline-none"
													value={scheduleData.date}
													onChange={(e) =>
														setScheduleData({
															...scheduleData,
															date: e.target.value,
														})
													}
												/>

												<input
													type="time"
													className="w-full rounded-lg border border-white/40 bg-white/60 px-4 py-2 focus:outline-none"
													value={scheduleData.time}
													onChange={(e) =>
														setScheduleData({
															...scheduleData,
															time: e.target.value,
														})
													}
												/>

												<input
													type="text"
													placeholder="Location / Meeting Link"
													className="w-full rounded-lg border border-white/40 bg-white/60 px-4 py-2 focus:outline-none"
													value={scheduleData.location}
													onChange={(e) =>
														setScheduleData({
															...scheduleData,
															location: e.target.value,
														})
													}
												/>
											</div>

											<div className="flex justify-end gap-3 mt-6">
												<button
													className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
													onClick={() => {
														setShowScheduleModal(false);
														setScheduleData({
															date: "",
															time: "",
															location: "",
														});
													}}
													type="button"
												>
													Cancel
												</button>

												<button
													onClick={async () => {
														setShowScheduleModal(false);

														await updateCandidateStatusMutation.mutateAsync({
															applicantId: candidateId,
															newStatus: pendingStatus,
														});

														Swal.fire({
															icon: "success",
															title: "Scheduled Successfully",
															html: `
																		<strong>Status:</strong> ${pendingStatus}<br/>
																		<strong>Date:</strong> ${scheduleData.date}<br/>
																		<strong>Time:</strong> ${scheduleData.time}<br/>
																		<strong>Location:</strong> ${scheduleData.location}
																	`,
															confirmButtonColor: "#E30022",
														});

														setScheduleData({
															date: "",
															time: "",
															location: "",
														});
													}}
													className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition"
													type="button"
												>
													Save & Update
												</button>
											</div>
										</div>
									</div>
								)}

								{hrReportsData.length > 0 ? (
									<div className="flex flex-col gap-4 w-full overflow-auto">
										{hrReportsData.map((report, idx) => (
											<div
												key={report.id}
												className="bg-white p-4 rounded-lg shadow-md border border-gray-200 w-full relative flex flex-col gap-2"
											>
												<div className="absolute top-2 right-2 flex gap-2">
													{report.staff_id === userId && (
														<>
															<button
																type="button"
																onClick={() => handleEditReport(idx)}
																className="text-blue-600 hover:text-blue-800"
																aria-label="Edit HR evaluation"
																title="Edit"
															>
																<FiEdit2 size={18} />
															</button>
															<button
																type="button"
																onClick={() => handleDeleteReport(report.id)}
																className="text-red-600 hover:text-red-800"
																aria-label="Delete HR evaluation"
																title="Delete"
															>
																<FiTrash2 size={18} />
															</button>
														</>
													)}
												</div>

												<p className="flex items-start gap-2">
													<span className="font-semibold text-gray-700">
														Score:
													</span>{" "}
													<span className="inline-flex items-center space-x-2 text-red-600 font-bold">
														{[...Array(5)].map((_, i) => {
															const filled = i < Math.floor(report.score || 0);

															return (
																<svg
																	key={`${report.id}-star-${i}`}
																	className={`w-5 h-5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
																	fill="currentColor"
																	viewBox="0 0 20 20"
																	role="img"
																	aria-label={
																		filled
																			? "Filled rating star"
																			: "Empty rating star"
																	}
																>
																	<title>
																		{filled
																			? "Filled rating star"
																			: "Empty rating star"}
																	</title>
																	<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.184 3.642a1 1 0 00.95.69h3.813c.969 0 1.371 1.24.588 1.81l-3.087 2.243a1 1 0 00-.364 1.118l1.184 3.642c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.087 2.243c-.785.57-1.84-.197-1.54-1.118l1.184-3.642a1 1 0 00-.364-1.118L3.106 9.07c-.783-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.184-3.642z" />
																</svg>
															);
														})}
														<span className="text-sm text-red-600">
															({report.score || 0}/5)
														</span>
													</span>
												</p>
												<p>
													<span className="font-semibold text-gray-700">
														Highlights:
													</span>{" "}
													<br />
													{report.highlights.join(", ")}
												</p>
												<p>
													<span className="font-semibold text-gray-700">
														Summary:
													</span>{" "}
													<br />
													{report.summary}
												</p>
												<p className="mt-2 text-sm text-gray-500">
													<em>
														Report by {report.staff_name} on{" "}
														{formatDate(report.created_at)}
													</em>
												</p>

												{editingIndex === idx && report.staff_id === userId && (
													<div className="mt-3 p-3 border border-gray-200 rounded bg-gray-50">
														<h4 className="font-semibold mb-3">
															Edit HR Evaluation
														</h4>

														<div className="grid gap-3">
															<div>
																<label
																	htmlFor="score"
																	className="block text-sm font-semibold mb-1"
																>
																	Score (out of 5)
																</label>
																<input
																	id="score"
																	type="number"
																	min={0}
																	max={5}
																	step={0.1}
																	value={editScore}
																	onChange={(e) =>
																		setEditScore(parseFloat(e.target.value))
																	}
																	className="w-full border rounded px-3 py-2"
																/>
															</div>

															<div>
																<label
																	htmlFor="highlights"
																	className="block text-sm font-semibold mb-1"
																>
																	Key Highlights
																</label>
																<textarea
																	id="highlights"
																	value={editHighlights}
																	onChange={(e) =>
																		setEditHighlights(e.target.value)
																	}
																	className="w-full border rounded px-3 py-2"
																	rows={3}
																	placeholder="e.g. Communication, Leadership, React"
																/>
															</div>

															<div>
																<label
																	htmlFor="summary"
																	className="block text-sm font-semibold mb-1"
																>
																	Summary Evaluation
																</label>
																<textarea
																	id="summary"
																	value={editSummary}
																	onChange={(e) =>
																		setEditSummary(e.target.value)
																	}
																	className="w-full border rounded px-3 py-2"
																	rows={3}
																/>
															</div>

															<div className="flex justify-end gap-2">
																<button
																	type="button"
																	onClick={handleCancelEdit}
																	className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
																	disabled={updateHRReportMutation.isPending}
																>
																	Cancel
																</button>
																<button
																	type="button"
																	onClick={handleSaveEdit}
																	className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition"
																	disabled={updateHRReportMutation.isPending}
																>
																	{updateHRReportMutation.isPending
																		? "Saving..."
																		: "Save"}
																</button>
															</div>
														</div>
													</div>
												)}
											</div>
										))}
									</div>
								) : (
									<p className="text-gray-500 italic text-center mt-4">
										No HR evaluations yet.
									</p>
								)}
							</div>
						</div>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<div className={`${glassCard} p-4 h-full overflow-auto`}>
								<CandidateResume
									candidateProfile={candidateProfileQuery.data}
								/>
							</div>

							<div className={`${glassCard} p-6`}>
								<h2 className="text-2xl font-bold mb-6">
									<span className="text-red-600">Tech</span> Stack
								</h2>

								<div className="w-full h-80">
									<ResponsiveContainer width="100%" height="100%">
										<RadarChart data={languageRadarData}>
											<PolarGrid stroke="rgba(0,0,0,0.15)" />
											<PolarAngleAxis
												dataKey="language"
												tick={{ fill: "#374151", fontSize: 12 }}
											/>
											<PolarRadiusAxis
												angle={30}
												domain={[0, 100]}
												tick={{ fontSize: 10 }}
											/>
											<Radar
												name="Proficiency"
												dataKey="level"
												stroke="#E30022"
												fill="#E30022"
												fillOpacity={0.35}
											/>
										</RadarChart>
									</ResponsiveContainer>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</main>
	);
}
