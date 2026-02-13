"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SkillTag = {
  skill: string;
  rating?: number;
};

export default function SkillAssessmentPage() {
  const router = useRouter();

  const [tags, setTags] = useState<SkillTag[]>([
    { skill: "JavaScript" },
    { skill: "React" },
    { skill: "TypeScript" },
    { skill: "Node.js" },
    { skill: "Database Management" },
  ]);

  return (
    <div className="min-h-screen bg-linear-to-br from-red-100 via-white to-red-50 px-6 py-12 flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="mb-12">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div
                className="w-12 h-12 flex items-center justify-center 
        rounded-full text-sm font-bold
        bg-gradient-to-br from-red-600 to-rose-500
        text-white shadow-lg shadow-red-500/30"
              >
                1
              </div>

              <span className="ml-3 text-sm font-semibold text-red-600 tracking-wide">
                Application Form
              </span>
            </div>
            <div className="flex-1 h-[2px] mx-6 bg-gradient-to-r from-red-600 to-rose-500 rounded-full" />

            <div className="flex items-center">
              <div
                className="w-12 h-12 flex items-center justify-center 
        rounded-full text-sm font-bold
        bg-gradient-to-br from-red-600 to-rose-500
        text-white shadow-lg shadow-red-500/30"
              >
                2
              </div>

              <span className="ml-3 text-sm font-semibold text-red-600 tracking-wide">
                Skill Assessment
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-2xl p-10 relative">
          <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-red-500/10 via-transparent to-black/10 pointer-events-none" />
          <div className="relative">
            <h1 className="text-3xl font-bold text-red-600 mb-2 text-center">
              SKILL ASSESSMENT
            </h1>
            <hr></hr>
            <p className="text-gray-600 mb-8 text-center">
              Please rate your proficiency in the following skills before
              completing your application.
            </p>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-md border border-white/40"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{tag.skill}</p>
                    <p className="text-xs text-gray-500">
                      Rate from 1 (Beginner) to 5 (Expert)
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => {
                      const isSelected = tag.rating === num;

                      return (
                        <button
                          key={num}
                          type="button"
                          className={`w-9 h-9 rounded-full border text-sm font-semibold transition ${
                            isSelected
                              ? "bg-red-600 text-white border-red-600"
                              : "border-gray-300 text-gray-700 bg-white/70 hover:bg-red-600 hover:text-white hover:border-red-600"
                          }`}
                          onClick={() =>
                            setTags((prevTags) =>
                              prevTags.map((t, i) =>
                                i === index ? { ...t, rating: num } : t,
                              ),
                            )
                          }
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-between gap-3">
              <button
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                onClick={() => router.back()}
                type="button"
              >
                Back to Application
              </button>

              <button
                className="px-6 py-2 rounded-lg bg-linear-to-r from-red-600 to-red-500 text-white font-bold shadow-lg hover:scale-[1.02] transition"
                type="button"
              >
                Complete Application
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
