"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { auth } from "@/lib/firebase/client";
import { swalError, swalInfo } from "@/lib/swal";
import { trpc } from "@/lib/trpc/client";

export default function LoginPage() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [jwtSuccess, setJwtSuccess] = useState(false);
  const { isAuthenticated } = useAuth({ routerActivation: false });
  const [showPassword, setShowPassword] = useState(false);
  const jwtInfo = trpc.auth.decodeJWT.useQuery(undefined, {
    enabled: isAuthenticated && jwtSuccess,
  });

  useEffect(() => {
    if (isAuthenticated && jwtInfo.data) {
      const role = jwtInfo.data.user.role;
      if (role === "HR Officer") {
        router.push("/admin/jobs");
      } else {
        router.push("/admin");
      }
    }
  }, [jwtInfo.data, router, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAuthLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString().trim();

    if (!email || !password) {
      setIsAuthLoading(false);
      swalInfo(
        "Missing Credentials",
        "Please enter both email and password to continue.",
      );
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);

      setJwtSuccess(true);
      void jwtInfo.refetch();
    } catch (error) {
      auth.signOut();

      let message = "Authentication failed. Please try again.";

      const firebaseError = error as { code?: string };

      if (firebaseError?.code === "auth/invalid-credential") {
        message = "Invalid email or password.";
      } else if (firebaseError?.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (firebaseError?.code === "auth/wrong-password") {
        message = "Incorrect password.";
      } else if (firebaseError?.code === "auth/too-many-requests") {
        message =
          "Too many failed attempts. Please wait a moment and try again.";
      }

      swalError("Login Failed", message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <div
      className="
    relative
    h-full
    w-full
    flex
    items-center
    justify-center
    bg-gradient-to-br from-white via-red-50/30 to-white
    px-4
  "
    >
      <div className="absolute -top-40 -left-40 w-[450px] h-[450px] bg-red-400/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-[450px] h-[450px] bg-red-500/20 rounded-full blur-3xl" />

      <div
        className="
          relative
          w-full
          max-w-md
          sm:max-w-2xl
          lg:max-w-4xl
          xl:max-w-5xl
        "
      >
        <div
          className="
        relative
        grid md:grid-cols-[1.4fr_1fr]
        rounded-[32px]
        border border-white/40
        bg-white/55
        backdrop-blur-3xl
        shadow-[0_40px_120px_rgba(220,38,38,0.15)]
        overflow-hidden
      "
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-red-100/30 pointer-events-none" />

          <div className="relative p-10 flex flex-col justify-center">
            <div className="mb-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-red-600">
                Secure Access
              </p>
              <h1 className="mt-3 text-3xl font-extrabold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Log in to your Alliance Software Inc. Careers account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label
                  htmlFor="email"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-red-600"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  className="
                    w-full rounded-2xl px-5 py-3
                    bg-white/70 backdrop-blur-xl
                    border border-white/40
                    text-gray-700 font-semibold placeholder:text-gray-400
                    shadow-[0_15px_50px_rgba(220,38,38,0.08)]
                    focus:ring-2 focus:ring-red-400/40 focus:border-red-300
                    transition-all duration-300 outline-none
                  "
                />
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-red-600"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    className="
                      w-full rounded-2xl px-5 py-3 pr-16
                      bg-white/70 backdrop-blur-xl
                      border border-white/40
                      text-gray-700 font-semibold placeholder:text-gray-400
                      shadow-[0_15px_50px_rgba(220,38,38,0.08)]
                      focus:ring-2 focus:ring-red-400/40 focus:border-red-300
                      transition-all duration-300 outline-none
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="
                      absolute right-4 top-1/2 -translate-y-1/2
                      text-sm font-semibold text-red-600
                      hover:text-red-700 transition
                    "
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <input type="checkbox" className="accent-red-600 w-4 h-4" />
                  Remember me
                </label>

                <Link
                  href="/"
                  className="text-red-600 font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="
              relative w-full rounded-2xl px-6 py-3
              font-bold uppercase tracking-[0.18em]
              bg-gradient-to-r from-red-600 to-red-500
              text-white
              shadow-[0_25px_80px_rgba(220,38,38,0.25)]
              hover:scale-[1.02]
              transition-all duration-300
              disabled:opacity-60 disabled:cursor-not-allowed
            "
              >
                {isAuthLoading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          </div>

          <div
            className="hidden md:block bg-cover bg-center"
            style={{ backgroundImage: "url('/workspace.jpg')" }}
          />
        </div>
      </div>
    </div>
  );
}
