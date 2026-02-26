"use client";

import Link from "next/link";
import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import { auth } from "@/lib/firebase/client";
import { updatePasswordSchema } from "@/lib/schemas";
import { trpc } from "@/lib/trpc/client";

enum Status {
  Idle,
  Success,
  Error,
}

export default function UpdatePasswordPage() {
  useAuth();

  const updatePasswordMutation = trpc.auth.updatePassword.useMutation();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setStatus] = useState<Status>(Status.Idle);
  const [, setMessage] = useState<string>("");

  const passwordValidity = updatePasswordSchema.safeParse({
    newPassword: password,
    confirmPassword: confirm,
  });

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setStatus(Status.Idle);
    setMessage("");

    if (!passwordValidity.success) {
      setStatus(Status.Error);
      setMessage(passwordValidity.error.message);
      return;
    }

    setIsSubmitting(true);

    await updatePasswordMutation.mutateAsync(
      {
        currentPassword: password,
        newPassword: confirm,
        confirmPassword: confirm,
      },
      {
        onSuccess() {
          setStatus(Status.Success);
          setMessage("Password updated successfully. You may now log in.");
          auth.signOut(); // Log out the user after password change
        },
        onError(error) {
          setStatus(Status.Error);
          setMessage(
            error instanceof Error
              ? error.message
              : "Update failed. Please request a new link from your admin.",
          );
        },
        onSettled() {
          setIsSubmitting(false);
        },
      },
    );
  }

  return (
    <div
      className="
        relative
        h-full
        w-full
        flex
        items-center
        justify-center
        bg-linear-to-br from-white via-red-50/30 to-white
        px-4
      "
    >
      <div className="absolute -top-40 -left-40 w-112.5 h-112.5 bg-red-400/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-112.5 h-112.5 bg-red-500/20 rounded-full blur-3xl" />

      <div
        className="
          relative
          w-full
          max-w-md
          sm:max-w-lg
          lg:max-w-xl
          xl:max-w-2xl
        "
      >
        <div
          className="
          relative
          rounded-4xl
          border border-white/40
          bg-white/55
          backdrop-blur-3xl
          p-10
          shadow-[0_40px_120px_rgba(220,38,38,0.15)]
          overflow-hiddenz
        "
        >
          <div className="absolute inset-0 bg-linear-to-br from-white/40 via-transparent to-red-100/30 pointer-events-none" />

          <div className="relative">
            <div className="mb-8 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-red-600">
                Secure Access
              </p>
              <h1 className="mt-3 text-3xl font-extrabold bg-linear-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                Update Password
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Keep your account protected with a strong password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label
                  htmlFor="newPassword"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-red-600"
                >
                  New Password
                </label>

                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className={[
                      "w-full rounded-2xl px-5 py-3 pr-16",
                      "bg-white/70 backdrop-blur-xl",
                      "border border-white/40",
                      "text-gray-700 font-semibold placeholder:text-gray-400",
                      "shadow-[0_15px_50px_rgba(220,38,38,0.08)]",
                      "focus:ring-2 focus:ring-red-400/40 focus:border-red-300",
                      "transition-all duration-300 outline-none",
                    ].join(" ")}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="
                  absolute right-3 top-1/2 -translate-y-1/2
                  rounded-xl
                  px-3 py-2
                  text-xs font-bold uppercase tracking-[0.15em]
                  bg-white/60 backdrop-blur-md
                  border border-white/40
                  text-red-600
                  shadow-sm
                  hover:bg-white/80
                  transition
                "
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>

                <div
                  className="
              rounded-2xl
              border border-white/40
              bg-white/50
              backdrop-blur-xl
              p-4
              shadow-inner
            "
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-600">
                    Password Rules
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600 font-medium">
                    <li>• At least 8 characters</li>
                    <li>• 1 uppercase letter</li>
                    <li>• 1 lowercase letter</li>
                    <li>• 1 number</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-red-600"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm new password"
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
                    onClick={() => setShowConfirm((v) => !v)}
                    className="
                  absolute right-3 top-1/2 -translate-y-1/2
                  rounded-xl
                  px-3 py-2
                  text-xs font-bold uppercase tracking-[0.15em]
                  bg-white/60 backdrop-blur-md
                  border border-white/40
                  text-red-600
                  shadow-sm
                  hover:bg-white/80
                  transition
                "
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!passwordValidity.success || isSubmitting}
                className={[
                  "relative w-full rounded-2xl px-6 py-3",
                  "font-bold uppercase tracking-[0.18em]",
                  "transition-all duration-300",
                  !passwordValidity.success || isSubmitting
                    ? "bg-linear-to-r from-red-600 to-red-500 text-white shadow-[0_25px_80px_rgba(220,38,38,0.25)] hover:scale-[1.02]"
                    : "bg-white/60 border border-white/40 text-gray-400 cursor-not-allowed",
                ].join(" ")}
              >
                {isSubmitting ? "Updating…" : "Update Password"}
              </button>

              <div className="pt-4 text-center">
                <Link
                  href="/login"
                  className="
                inline-flex items-center justify-center
                rounded-2xl
                px-5 py-2
                text-xs font-bold uppercase tracking-[0.18em]
                bg-white/60 backdrop-blur-md
                border border-white/40
                text-red-600
                shadow-sm
                hover:bg-white/80
                transition
              "
                >
                  Back to Dashboard
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
