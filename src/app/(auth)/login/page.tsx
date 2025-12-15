"use client";

import { Button } from "@/components/common/Button";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc/client";

export default function LoginPage() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAuthLoading(true);
    const { userInfo, isAuthenticated } = useAuth({
      fetchUser: true,
    });
    const jwtInfo = trpc.auth.decodeJWT.useQuery(undefined, {
      enabled: isAuthenticated,
    });
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString().trim();
    const isAdmin = userInfo.isSuccess && jwtInfo.data?.user.isAdmin;
    if (!email || !password) {
      alert("Please enter valid credentials");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const res = await fetch("/api/auth/jwt", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userCredential.user.uid}`,
        },
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to authenticate");

      if (isAdmin) {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
      router.refresh();
    } catch (error) {
      alert("Authentication failed");
      auth.signOut();
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
              <label className="text-sm text-gray-500">Email address</label>
              <input
                type="email"
                name="email"
                required
                className="w-full mt-1 px-4 py-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Password</label>
              <input
                type="password"
                name="password"
                required
                className="w-full mt-1 px-4 py-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-300">
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
              className="flex mb-5 justify-center items-center w-full bg-red-600 text-white font-bold px-4 py-3 rounded-md border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
            >
              {isAuthLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-l text-gray-500 mb-2">
            Don't have an account yet?{" "}
            <span className="text-red-600">
              <Link href="/signup" className="text-red-500 hover:underline">
                Signup Here!
              </Link>
            </span>
          </p>
        </div>

        <div
          className="hidden md:block bg-cover bg-center"
          style={{ backgroundImage: "url('/workspace.jpg')" }}
        />
      </div>
    </div>
  );
}
