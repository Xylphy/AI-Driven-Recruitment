"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function UpdatePasswordPage() {
  // const router = useRouter();
  const searchParams = useSearchParams();

  // Admin-provided link could include something like ?token=abc123
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  // const [message, setMessage] = useState<string>("");

  // const { passwordValid, confirmValid, canSubmit,  } = useMemo(() => {
  const { passwordValid, confirmValid, canSubmit } = useMemo(() => {
    const minLen = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    const passwordValidLocal = minLen && hasUpper && hasLower && hasNumber;
    const confirmValidLocal = confirm.length > 0 && confirm === password;

    const canSubmitLocal =
      !!token && passwordValidLocal && confirmValidLocal && !isSubmitting;

    let hintLocal = "";
    if (!token) hintLocal = "Missing or invalid password update link token.";
    else if (!minLen) hintLocal = "Password must be at least 8 characters.";
    else if (!hasUpper) hintLocal = "Add at least 1 uppercase letter.";
    else if (!hasLower) hintLocal = "Add at least 1 lowercase letter.";
    else if (!hasNumber) hintLocal = "Add at least 1 number.";
    else if (confirm.length > 0 && confirm !== password)
      hintLocal = "Passwords do not match.";

    return {
      passwordValid: passwordValidLocal,
      confirmValid: confirmValidLocal,
      canSubmit: canSubmitLocal,
      hint: hintLocal,
    };
  }, [password, confirm, token, isSubmitting]);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    // setStatus("idle");
    // setMessage("");

    if (!canSubmit) {
      // setStatus("error");
      // setMessage(hint || "Please complete the form.");
      return;
    }

    setIsSubmitting(true);
    try {
      // ============================
      // PLACEHOLDER UPDATE LOGIC
      // ============================
      // Replace this with your real API call, e.g.
      // await trpc.auth.updatePassword.mutate({ token, password });
      // or Firebase confirmPasswordReset(auth, oobCode, newPassword)
      //
      await new Promise((r) => setTimeout(r, 600));
      // ============================

      // setStatus("success");
      // setMessage("Password updated successfully. You may now log in.");

      // Optional: auto-redirect after a short moment
      // setTimeout(() => router.push("/login"), 1200);
    } catch {
      // setStatus("error");
      // setMessage("Update failed. Please request a new link from your admin.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative overflow-hidden bg-linear-to-br from-white via-white to-red-50 px-6 py-14">
      <div className="relative mx-auto w-full max-w-md sm:max-w-xl lg:max-w-2xl">
        <div className="relative overflow-hidden rounded-3xl border border-red-200/60 bg-white/65 p-7 shadow-[0_35px_120px_rgba(220,38,38,0.12)] backdrop-blur-2xl">
          <div className="relative">
            <div className="mb-6">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-red-700">
                Secure Access
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-red-700">
                Update Password
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <label
                  htmlFor="newPassword"
                  className="text-xs font-extrabold uppercase tracking-[0.18em] text-red-700"
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
                      "w-full rounded-2xl border bg-white/70 px-4 py-3 pr-14",
                      "font-semibold text-red-700 placeholder:text-red-300",
                      "shadow-[0_18px_60px_rgba(220,38,38,0.10)] backdrop-blur-2xl",
                      "outline-none transition",
                      password.length === 0
                        ? "border-red-200/70"
                        : passwordValid
                          ? "border-red-300 ring-2 ring-red-400/25"
                          : "border-red-300 ring-2 ring-red-500/20",
                    ].join(" ")}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-red-200/60 bg-white/65 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-red-700 shadow-[0_12px_40px_rgba(220,38,38,0.10)] backdrop-blur-xl transition hover:bg-white/80"
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="rounded-2xl border border-red-200/60 bg-white/55 p-3 backdrop-blur-xl">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-red-700">
                    Password rules
                  </p>
                  <ul className="mt-2 space-y-1 text-xs font-semibold text-red-700/80">
                    <li>• At least 8 characters</li>
                    <li>• 1 uppercase letter</li>
                    <li>• 1 lowercase letter</li>
                    <li>• 1 number</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-extrabold uppercase tracking-[0.18em] text-red-700"
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
                    className={[
                      "w-full rounded-2xl border bg-white/70 px-4 py-3 pr-14",
                      "font-semibold text-red-700 placeholder:text-red-300",
                      "shadow-[0_18px_60px_rgba(220,38,38,0.10)] backdrop-blur-2xl",
                      "outline-none transition",
                      confirm.length === 0
                        ? "border-red-200/70"
                        : confirmValid
                          ? "border-red-300 ring-2 ring-red-400/25"
                          : "border-red-300 ring-2 ring-red-500/20",
                    ].join(" ")}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-red-200/60 bg-white/65 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-red-700 shadow-[0_12px_40px_rgba(220,38,38,0.10)] backdrop-blur-xl transition hover:bg-white/80"
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className={[
                  "relative w-full overflow-hidden rounded-2xl px-5 py-3",
                  "font-extrabold uppercase tracking-[0.16em]",
                  "shadow-[0_25px_90px_rgba(220,38,38,0.18)] transition",
                  canSubmit
                    ? "bg-linear-to-r from-red-600 to-red-500 text-white hover:opacity-95"
                    : "bg-white/70 text-red-700/60 border border-red-200/60 cursor-not-allowed",
                ].join(" ")}
              >
                <span className="relative z-10">
                  {isSubmitting ? "Updating…" : "Update Password"}
                </span>
                {canSubmit && (
                  <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-red-200/60 bg-white/65 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-red-700 shadow-[0_18px_60px_rgba(220,38,38,0.10)] backdrop-blur-xl transition hover:bg-white/80"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
