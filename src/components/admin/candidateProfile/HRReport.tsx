"use client";

import {
  Dialog,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { useParams } from "next/navigation";
import { Fragment, startTransition, useEffect, useRef, useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import useAuth from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc/client";
import type { CandidateStatuses } from "@/types/types";

interface HRReportProps {
  score?: number;
  keyHighlights?: string;
  summary?: string;
  onSubmit?: (data: {
    score: number;
    keyHighlights: string;
    summary: string;
  }) => void | Promise<void>;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLockRef = useRef(false);

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

  const resetForm = () => {
    setScore(0);
    setHighlights("");
    setSummary("");
  };

  const handleSubmit = async () => {
    if (submitLockRef.current || isSubmitting) return;

    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      const data = {
        score,
        keyHighlights: highlights,
        summary,
      };

      await onSubmit?.(data);

      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to submit staff evaluation:", error);
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        className="
          flex items-center gap-2
          px-6 py-2.5
          rounded-xl
          bg-linear-to-r from-red-600 to-red-500
          text-white font-semibold
          shadow-lg
          hover:scale-105
          transition-all duration-200
          disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
        "
        onClick={() => setIsOpen(true)}
        type="button"
        disabled={isSubmitting}
      >
        <FiPlus />
        Add Staff Evaluation
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => {
            if (!isSubmitting) setIsOpen(false);
          }}
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
                  onClick={() => {
                    if (!isSubmitting) setIsOpen(false);
                  }}
                  className="
                    absolute top-4 right-4
                    p-2 rounded-lg
                    bg-white/40
                    backdrop-blur-md
                    border border-white/40
                    hover:bg-red-600 hover:text-white
                    transition
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  type="button"
                  disabled={isSubmitting}
                >
                  <FiX />
                </button>

                <DialogTitle className="text-2xl font-bold text-gray-800 mb-6">
                  Staff Evaluation
                </DialogTitle>

                <div className="space-y-6">
                  <div className="w-full lg:w-55 bg-linear-to-r from-red-600 to-red-500 text-white border border-red-500/70 shadow-lg font-semibold px-4 py-2 rounded-xl">
                    {selectedStatus || "Candidate Status"}
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

                        if (numericValue >= 1 && numericValue <= 5) {
                          setScore(numericValue);
                        }
                      }}
                      onBlur={() => {
                        if (score < 1) setScore(1);
                        if (score > 5) setScore(5);
                      }}
                      disabled={isSubmitting}
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
                        disabled:opacity-60 disabled:cursor-not-allowed
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
                      disabled={isSubmitting}
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
                        disabled:opacity-60 disabled:cursor-not-allowed
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
                      disabled={isSubmitting}
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
                        disabled:opacity-60 disabled:cursor-not-allowed
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

                    <div className="relative rounded-2xl border border-red-600 bg-red-600/10 backdrop-blur-md shadow-lg hover:bg-white/15 transition-all duration-300">
                      <input
                        id="fileUpload"
                        type="file"
                        name="fileUpload"
                        disabled={isSubmitting}
                        className="
                          w-full cursor-pointer text-sm text-black/80
                          file:mr-4 file:rounded-xl file:border-0
                          file:bg-red-600 file:px-4 file:py-2
                          file:text-sm file:font-medium file:text-white
                          file:hover:bg-red-500
                          file:transition-all file:duration-300
                          p-3
                          focus:outline-none
                          disabled:opacity-60 disabled:cursor-not-allowed
                        "
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                  <button
                    onClick={() => {
                      if (!isSubmitting) setIsOpen(false);
                    }}
                    className="
                      px-5 py-2.5
                      rounded-xl
                      bg-white/40
                      backdrop-blur-md
                      border border-white/40
                      hover:bg-gray-200/50
                      transition
                      disabled:opacity-60 disabled:cursor-not-allowed
                    "
                    type="button"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="
                      px-6 py-2.5
                      rounded-xl
                      bg-linear-to-r from-red-600 to-red-500
                      text-white font-semibold
                      shadow-md
                      hover:scale-105
                      transition-all
                      disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
                    "
                    type="button"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Report"}
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
