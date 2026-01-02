"use client";

import { useState, Fragment } from "react";
import {
  Dialog,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";

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
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition"
      >
        Add HR Officer Report
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed z-50 inset-0 overflow-y-auto"
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
              <div className="fixed inset-0 bg-black bg-opacity-30" />
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
              <div className="bg-white rounded-lg max-w-lg w-full p-6 z-10">
                <DialogTitle className="text-lg font-bold mb-4">
                  HR Evaluation Report
                </DialogTitle>

                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold mb-1">
                      Score (out of 5)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      step={0.1}
                      value={score}
                      onChange={(e) => setScore(parseFloat(e.target.value))}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">
                      Key Highlights
                    </label>
                    <textarea
                      value={highlights}
                      onChange={(e) => setHighlights(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      rows={3}
                      placeholder="Highlight candidate's strengths"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">
                      Summary Evaluation
                    </label>
                    <textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      rows={3}
                      placeholder="Add your summary evaluation"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition"
                  >
                    Submit
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
