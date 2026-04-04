"use client";

import {
  Dialog,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";

interface HRReportProps {
  score?: number;
  keyHighlights?: string;
  summary?: string;
  status: string;
  onSubmit: (data: {
    score: number;
    keyHighlights: string;
    summary: string;
    evaluationFile?: File;
  }) => Promise<void> | void;
}

export default function HRReport({
  score: initialScore = 0,
  keyHighlights: initialKeyHighlights = "",
  summary: initialSummary = "",
  status: selectedStatus,
  onSubmit,
}: HRReportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [score, setScore] = useState<number>(initialScore);
  const [highlights, setHighlights] = useState(initialKeyHighlights);
  const [summary, setSummary] = useState(initialSummary);
  const [evaluationFile, setEvaluationFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ summary?: string }>({});

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const newErrors: { summary?: string } = {};

    if (!summary.trim()) {
      newErrors.summary = "Summary is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const data = {
      score,
      keyHighlights: highlights,
      summary,
      ...(evaluationFile ? { evaluationFile } : {}),
    };

    try {
      await Promise.resolve(onSubmit(data));

      setIsOpen(false);
      setScore(0);
      setHighlights("");
      setSummary("");
      setEvaluationFile(null);
    } catch (err) {
      console.error("HRReport submission error:", err);
    } finally {
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
                  onClick={() => !isSubmitting && setIsOpen(false)}
                  disabled={isSubmitting}
                  aria-disabled={isSubmitting}
                  className={
                    `absolute top-4 right-4 p-2 rounded-lg bg-white/40 backdrop-blur-md border border-white/40 transition ` +
                    (isSubmitting
                      ? `opacity-60 cursor-not-allowed`
                      : `hover:bg-red-600 hover:text-white`)
                  }
                  type="button"
                >
                  <FiX />
                </button>

                <DialogTitle className="text-2xl font-bold text-gray-800 mb-6">
                  Staff Evaluation
                </DialogTitle>

                <div className="space-y-6">
                  <div className="w-full lg:w-55 bg-linear-to-r from-red-600 to-red-500 text-white border border-red-500/70 shadow-lg font-semibold px-4 py-2 rounded-xl">
                    {selectedStatus || "Status not available"}
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
                      className={
                        `w-full px-4 py-2.5 rounded-xl bg-white/60 backdrop-blur-md border border-white/40 focus:outline-none focus:ring-2 focus:ring-red-400/50 transition ` +
                        (isSubmitting ? `opacity-60 cursor-not-allowed` : ``)
                      }
                      disabled={isSubmitting}
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
                      className={
                        `w-full px-4 py-2.5 rounded-xl bg-white/60 backdrop-blur-md border border-white/40 focus:outline-none focus:ring-2 focus:ring-red-400/50 transition ` +
                        (isSubmitting ? `opacity-60 cursor-not-allowed` : ``)
                      }
                      disabled={isSubmitting}
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
                      className={
                        `w-full px-4 py-2.5 rounded-xl bg-white/60 backdrop-blur-md border border-white/40 focus:outline-none focus:ring-2 focus:ring-red-400/50 transition ` +
                        (isSubmitting ? `opacity-60 cursor-not-allowed` : ``)
                      }
                      disabled={isSubmitting}
                    />
                    {errors.summary && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.summary}
                      </p>
                    )}
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
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          setEvaluationFile(file);
                        }}
                        disabled={isSubmitting}
                        className={
                          `w-full cursor-pointer text-sm text-black/80 file:mr-4 file:rounded-xl file:border-0 file:bg-red/600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-black file:hover:bg-red/300 file:transition-all file:duration-300 p-3 focus:outline-none ` +
                          (isSubmitting ? `opacity-60 cursor-not-allowed` : ``)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                  <button
                    onClick={() => !isSubmitting && setIsOpen(false)}
                    disabled={isSubmitting}
                    aria-disabled={isSubmitting}
                    className={
                      `px-5 py-2.5 rounded-xl bg-white/40 backdrop-blur-md border border-white/40 transition ` +
                      (isSubmitting
                        ? `opacity-60 cursor-not-allowed`
                        : `hover:bg-gray-200/50`)
                    }
                    type="button"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    className={
                      `px-6 py-2.5 rounded-xl bg-linear-to-r from-red-600 to-red-500 text-white font-semibold shadow-md transition-all ` +
                      (isSubmitting
                        ? `opacity-60 cursor-not-allowed hover:scale-100`
                        : `hover:scale-105`)
                    }
                    type="button"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <title>Submitting...</title>
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="opacity-25"
                          />
                          <path
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            fill="currentColor"
                            className="opacity-75"
                          />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      "Submit Report"
                    )}
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
