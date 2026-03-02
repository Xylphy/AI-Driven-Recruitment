"use client";

import {
  Dialog,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState, startTransition, useEffect } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { CANDIDATE_STATUSES } from "@/lib/constants";
import type { CandidateStatuses } from "@/types/types";
import { trpc } from "@/lib/trpc/client";
import useAuth from "@/hooks/useAuth";
import { useParams } from "next/navigation";

interface HRReportProps {
  score?: number;
  keyHighlights?: string;
  summary?: string;
  onSubmit?: (data: {
    score: number;
    keyHighlights: string;
    summary: string;
  }) => void;
}

export default function HRReport({
  score: initialScore = 0,
  keyHighlights: initialKeyHighlights = "",
  summary: initialSummary = "",
  onSubmit,
}: HRReportProps) {
  const { isAuthenticated } = useAuth();
  const candidateId = useParams().id as string;
  const [isOpen, setIsOpen] = useState(false);
  const [score, setScore] = useState<number>(initialScore);
  const [highlights, setHighlights] = useState(initialKeyHighlights);
  const [summary, setSummary] = useState(initialSummary);
  const [selectedStatus, setSelectedStatus] =
    useState<CandidateStatuses | null>(null);

  const candidateProfileQuery = trpc.candidate.fetchCandidateProfile.useQuery(
    {
      candidateId,
      fetchScore: true,
      fetchTranscribed: true,
      fetchResume: true,
      fetchSkills: true,
      fetchSocialLinks: true,
    },
    { enabled: isAuthenticated },
  );

  useEffect(() => {
    startTransition(() =>
      setSelectedStatus(candidateProfileQuery.data?.status ?? null),
    );
  }, [candidateProfileQuery.data?.status]);

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newStatus = e.target.value as CandidateStatuses | null;
    if (!newStatus) return;
    if (CANDIDATE_STATUSES.includes(newStatus)) {
      setPendingStatus(newStatus);
      return;
    }
  };

  const handleSubmit = () => {
    const data = { score, keyHighlights: highlights, summary };

    if (onSubmit) {
      onSubmit(data);
    }

    setIsOpen(false);
    setScore(0);
    setHighlights("");
    setSummary("");
  };

  return (
    <div className="flex flex-col items-center">
      <button
        className="
          flex items-center gap-2
          px-6 py-2.5
          rounded-xl
          bg-gradient-to-r from-red-600 to-red-500
          text-white font-semibold
          shadow-lg
          hover:scale-105
          transition-all duration-200
        "
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <FiPlus />
        Add Staff Evaluation
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setIsOpen(false)}
        >
          <div className="flex items-center justify-center min-h-screen px-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            </TransitionChild>

            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div
                className="
                  relative
                  w-full max-w-xl
                  p-8
                  rounded-2xl
                  bg-white/50
                  backdrop-blur-2xl
                  border border-white/30
                  shadow-[0_20px_60px_rgba(0,0,0,0.15)]
                "
              >
                <button
                  onClick={() => setIsOpen(false)}
                  className="
                    absolute top-4 right-4
                    p-2 rounded-lg
                    bg-white/40
                    backdrop-blur-md
                    border border-white/40
                    hover:bg-red-600 hover:text-white
                    transition
                  "
                  type="button"
                >
                  <FiX />
                </button>

                <DialogTitle className="text-2xl font-bold text-gray-800 mb-6">
                  Staff Evaluation
                </DialogTitle>

                <div className="space-y-6">
                  <div className="relative">
                    <select
                      value={selectedStatus || ""}
                      onChange={handleStatusChange}
                      className="
                                      appearance-none
                                      w-full lg:w-55
                                      bg-linear-to-r from-red-600 to-red-500
                                      text-white
                                      border border-red-500/70
                                      shadow-lg
                                      font-semibold
                                      pl-4 pr-10 py-2
                                      rounded-xl
                                      transition-all duration-200
                                      hover:from-red-700 hover:to-red-600
                                      hover:shadow-xl
                                      focus:outline-none
                                      focus:ring-2
                                      focus:ring-red-300
                                      cursor-pointer
                                    "
                    >
                      <option value="" className="text-slate-900">
                        Select Status
                      </option>

                      {CANDIDATE_STATUSES.map((status) => (
                        <option
                          key={status}
                          value={status}
                          className="text-slate-900"
                        >
                          {status}
                        </option>
                      ))}
                    </select>

                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/90"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <label
                      htmlFor="score"
                      className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide"
                    >
                      Score (out of 5)
                    </label>
                    <input
                      id="score"
                      type="text"
                      inputMode="decimal"
                      value={score === 0 ? "" : score}
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value === "") {
                          setScore(0);
                          return;
                        }

                        if (!/^\d*\.?\d*$/.test(value)) return;

                        const numericValue = Number(value);

                        if (value.endsWith(".")) {
                          setScore(value as unknown as number);
                          return;
                        }

                        if (numericValue >= 1 && numericValue <= 5) {
                          setScore(numericValue);
                        }
                      }}
                      onBlur={() => {
                        if (typeof score === "number") {
                          if (score < 1) setScore(1);
                          if (score > 5) setScore(5);
                        }
                      }}
                      className="
                        w-full
                        px-4 py-2.5
                        rounded-xl
                        bg-white/60
                        backdrop-blur-md
                        border border-white/40
                        focus:outline-none
                        focus:ring-2 focus:ring-red-400/50
                        transition
                      "
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="keyHighlights"
                      className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide"
                    >
                      Key Highlights
                    </label>
                    <textarea
                      id="keyHighlights"
                      value={highlights}
                      onChange={(e) => setHighlights(e.target.value)}
                      placeholder="Enter key highlights separated by commas (e.g., Leadership, Communication, Problem Solving)"
                      rows={3}
                      className="
                        w-full
                        px-4 py-2.5
                        rounded-xl
                        bg-white/60
                        backdrop-blur-md
                        border border-white/40
                        focus:outline-none
                        focus:ring-2 focus:ring-red-400/50
                        transition
                      "
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="summary"
                      className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide"
                    >
                      Summary Evaluation
                    </label>
                    <textarea
                      id="summary"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Provide overall evaluation summary..."
                      rows={4}
                      className="
                        w-full
                        px-4 py-2.5
                        rounded-xl
                        bg-white/60
                        backdrop-blur-md
                        border border-white/40
                        focus:outline-none
                        focus:ring-2 focus:ring-red-400/50
                        transition
                      "
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="fileUpload"
                      className="block text-sm font-semibold text-white/80 mb-2 uppercase tracking-wide"
                    >
                      File Upload
                    </label>

                    <div className="relative rounded-2xl border border-red/600 bg-red/600 backdrop-blur-md shadow-lg hover:bg-white/15 transition-all duration-300">
                      <input
                        id="fileUpload"
                        type="file"
                        name="fileUpload"
                        className="
                          w-full cursor-pointer text-sm text-black/80
                          file:mr-4 file:rounded-xl file:border-0
                          file:bg-red/600 file:px-4 file:py-2
                          file:text-sm file:font-medium file:text-black
                          file:hover:bg-red/300
                          file:transition-all file:duration-300
                          p-3
                          focus:outline-none
                        "
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="
                      px-5 py-2.5
                      rounded-xl
                      bg-white/40
                      backdrop-blur-md
                      border border-white/40
                      hover:bg-gray-200/50
                      transition
                    "
                    type="button"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSubmit}
                    className="
                      px-6 py-2.5
                      rounded-xl
                      bg-gradient-to-r from-red-600 to-red-500
                      text-white font-semibold
                      shadow-md
                      hover:scale-105
                      transition-all
                    "
                    type="button"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
