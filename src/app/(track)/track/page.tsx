"use client";

import { Search } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ApplicationTrackPage() {
  const router = useRouter();
  const [applicationId, setApplicationId] = useState("");

  const handleTrack = () => {
    const id = applicationId.trim();
    if (!id) return;

    router.push(`/track_application/${encodeURIComponent(id)}` as Route);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="pointer-events-none absolute -top-40 -left-40 h-125 w-125 rounded-full bg-red-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-125 w-125 rounded-full bg-rose-400/20 blur-[120px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="grid w-full max-w-6xl grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-gray-900">
              Build Your Future with <br />
              <span className="bg-linear-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
                Alliance Software
              </span>
            </h1>

            <p className="max-w-xl text-gray-600 text-lg">
              We’re looking for passionate innovators to join our growing team.
              Explore opportunities and track your application progress anytime.
            </p>

            <Link
              href={"/"}
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-red-600 to-rose-500 px-6 py-3 font-semibold text-white shadow-lg hover:opacity-90 transition"
            >
              Apply Now
            </Link>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-white/40 bg-white/60 backdrop-blur-2xl shadow-[0_30px_70px_rgba(0,0,0,0.15)] p-8">
              <Image
                src="/track-pic.png"
                alt="Track Application"
                width={300}
                height={300}
                className="mx-auto mb-6 opacity-95"
              />

              <h2 className="text-2xl font-bold text-gray-900 text-center">
                Track Your Application
              </h2>

              <p className="text-center text-gray-600 mt-2 mb-6">
                Enter your Application ID to view your current status.
              </p>

              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. APP-2025-042"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  className="w-full rounded-xl bg-white/80 backdrop-blur border border-gray-300 px-12 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <button
                type="button"
                onClick={handleTrack}
                className="mt-6 w-full rounded-xl bg-linear-to-r from-red-600 to-rose-500 py-3 font-bold text-white shadow-lg hover:scale-[1.01] hover:opacity-90 transition"
              >
                Track Application
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
