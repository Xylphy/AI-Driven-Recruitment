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
  const [isOpen, setIsOpen] = useState(false);
  const [score, setScore] = useState<number>(initialScore);
  const [highlights, setHighlights] = useState(initialKeyHighlights);
  const [summary, setSummary] = useState(initialSummary);

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
        Add HR Officer Report
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
                  HR Evaluation Report
                </DialogTitle>

                <div className="space-y-6">
                  {/* Score */}
                  <div>
                    <label
                      htmlFor="score"
                      className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide"
                    >
                      Score (out of 5)
                    </label>
                    <input
                      id="score"
                      type="number"
                      min={0}
                      max={5}
                      step={0.1}
                      value={score}
                      onChange={(e) =>
                        setScore(parseFloat(e.target.value) || 0)
                      }
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
                      placeholder="Highlight candidate strengths (e.g., Leadership, Communication)"
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
