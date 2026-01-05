"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import Image from "next/image";
import type { Route } from "next";

export default function ApplicationTrackPage() {
  const router = useRouter();
  const [applicationId, setApplicationId] = useState("");

  const handleTrack = () => {
    const id = applicationId.trim();
    if (!id) return;

    router.push(`/track_application/${encodeURIComponent(id)}` as Route);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#ffe4e6,#f8fafc,#e5e7eb)]">
      <div className="relative w-full max-w-lg p-8 rounded-3xl bg-white/30 backdrop-blur-2xl border border-white/40 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
        {/* Decorative image */}
        <Image
          src={"/illustrations/tracking.svg"}
          alt="Tracking"
          width={160}
          height={160}
          className="w-40 mx-auto mb-6 opacity-90"
        />

        <h1 className="text-3xl font-extrabold text-center text-gray-800">
          Track Your Application
        </h1>

        <p className="text-center text-gray-600 mt-2 mb-6">
          Enter your Application ID to see your hiring progress in real time.
        </p>

        <div className="relative">
          <input
            type="text"
            placeholder="e.g. APP-2025-042"
            value={applicationId}
            onChange={(e) => setApplicationId(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/60 backdrop-blur border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Search className="absolute left-4 top-3.5 text-gray-500" />
        </div>

        <button
          onClick={handleTrack}
          className="mt-6 w-full bg-linear-to-r from-red-600 to-rose-500 text-white font-bold py-3 rounded-xl shadow-lg hover:opacity-90 transition"
        >
          Track Application
        </button>
      </div>
    </div>
  );
}
