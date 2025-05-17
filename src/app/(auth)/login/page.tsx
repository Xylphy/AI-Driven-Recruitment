"use client";

import { Button } from "@/app/components/common/Button";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/lib/firebase/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useCsrfToken from "@/app/hooks/useCsrfToken";

export default function LoginPage() {
  const router = useRouter();
  const { csrfToken, isLoading: isCsrfLoading } = useCsrfToken();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        router.push("/profile");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    let email = formData.get("email");
    let password = formData.get("password");

    if (!email) {
      alert("Please enter a valid email address");
      return;
    }
    email = email.toString().trim();

    if (!password) {
      alert("Please enter a valid password");
      return;
    }
    password = password.toString().trim();

    const user = await signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        if (userCredential.user) {
          return userCredential.user;
        }
      })
      .catch((error) => {
        alert(`Error: ${error.message}`);
        return null;
      });

    if (!user) {
      return;
    }

    if (!isCsrfLoading) {
      alert("CSRF token is not available. Please try again.");
      return;
    }

    fetch("/api/auth/jwt", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        Authorization: `Bearer ${user.uid}`,
      },
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          let errorDetail = `Status: ${res.status}`;
          try {
            const errorData = await res.json();
            errorDetail += `, Message: ${
              errorData.error || JSON.stringify(errorData)
            }`;
          } catch {
            errorDetail += `, Body: ${await res.text()}`;
          }
          // alert(`Failed to fetch user data. ${errorDetail}`);
          auth.signOut();
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          router.push("/profile");
        }
      })
      .catch(() => {
        alert("An unexpected error occurred during authentication.");
        auth.signOut();
      });
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-[#E30022] text-center mb-2 uppercase tracking-wide">
        Welcome Back!
      </h1>
      <hr></hr>
      <p className="text-center text-sm text-gray-700 mt-2 mb-6">
        Log in to your Alliance Software Inc. Careers account
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          id="email"
          name="email"
          className="w-full px-4 py-3 border border-red-500 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          name="password"
          className="w-full px-4 py-3 border border-red-500 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          required
        />
        <Button
          type="submit"
          className="flex justify-center items-center w-full bg-red-600 text-white font-bold px-4 py-3 rounded-md border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
        >
          LOG IN
        </Button>
      </form>
      <br></br>
      <p className="text-sm text-center text-gray-600 mb-3">
        Forgot your password?{" "}
        <a href="/signup" className="text-red-600 hover:underline">
          Click Here
        </a>
      </p>
      <hr></hr>
      <h1 className="text-4xl font-bold text-[#E30022] text-center mt-5 uppercase tracking-wide">
        NEW TO ALLIANCE
      </h1>
      <p className="text-center text-sm text-gray-700 mt-2 mb-6">
        <b>Start your journey with us!</b>
        <br></br>Create an account to apply for roles, get job alerts, and take
        the first step toward a rewarding career.
      </p>
      <Link
        href="/signup/"
        className="flex justify-center items-center w-full bg-red-600 text-white font-bold px-4 py-3 rounded-md border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
      >
        Get Started Here
      </Link>
    </>
  );
}
