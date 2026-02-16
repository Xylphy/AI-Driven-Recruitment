"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import useAuth from "@/hooks/useAuth";
import { auth } from "@/lib/firebase/client";
import { swalError, swalInfo } from "@/lib/swal";
import { trpc } from "@/lib/trpc/client";

export default function LoginPage() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [jwtSuccess, setJwtSuccess] = useState(false);
  const { isAuthenticated } = useAuth({ routerActivation: false });

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
    <div className="flex items-center justify-center bg-white px-6">
      <div className="max-w-5xl grid grid-cols-1 md:grid-cols-2 rounded-xl shadow-2xl bg-white">
        <div className="bg-white text-white p-10 flex flex-col justify-center">
          <h1 className="text-3xl text-red-600 font-bold mb-2">
            Welcome Back!
          </h1>
          <h3 className="text-l text-gray-500 mb-2">
            Log in to your Alliance Software Inc. <br />
            Careers account
          </h3>
          <hr className="border border-red-500 w-50" />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="pt-5">
              <label htmlFor="email" className="text-sm text-gray-500">
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                className="w-full mt-1 px-4 py-3 text-gray-600 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm text-gray-500">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                required
                className="w-full mt-1 px-4 py-3 text-gray-600 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" className="accent-red-600" />
                Remember me
              </label>

              <Link href="/" className="text-red-500 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isAuthLoading}
              className="flex mb-5 justify-center items-center w-full bg-linear-to-r from-red-600 to-rose-500 text-white font-bold px-4 py-3 rounded-md hover:scale-[1.01] hover:opacity-90 transition"
            >
              {isAuthLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>

        <div
          className="hidden md:block bg-cover bg-center"
          style={{ backgroundImage: "url('/workspace.jpg')" }}
        />
      </div>
    </div>
  );
}
