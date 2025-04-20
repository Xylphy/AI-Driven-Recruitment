"use client";

import {
  createUserWithEmailAndPassword,
  isSignInWithEmailLink,
} from "firebase/auth";
import { Button } from "../../../components/common/Button";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { auth } from "@/app/lib/firebase/firebase";

export default function Verification({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState("");
  const [email, setEmail] = useState("");
  const { id } = use(params);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const csrfResponse = await fetch("/api/csrf");
        if (!csrfResponse.ok) {
          throw new Error("Failed to fetch CSRF token");
        }
        const csrfData = await csrfResponse.json();
        setCsrfToken(csrfData.csrfToken);

        const emailResponse = await fetch("/api/users/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfData.csrfToken,
          },
          body: JSON.stringify({ id }),
        });

        if (!emailResponse.ok) {
          router.push("/signup");
        }
        const emailData = await emailResponse.json();
        setEmail(emailData);
      } catch (error) {
        if (error instanceof Error) {
          alert("Error: " + error.message);
        } else {
          alert("An unknown error occurred");
        }
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    const data = {
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      token: id,
    };

    if (!isSignInWithEmailLink(auth, window.location.href)) {
      alert("Invalid link");
      return;
    }

    try {
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        (data.password as string).trim()
      );

      const uid = userCredential.user.uid;

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ ...data, uid }),
      });

      if (response.ok) {
        alert("Password set successfully");
      } else {
        alert("Error setting password");
        return;
      }
    } catch (error: any) {
      alert("Error signing in with email link:" + error);
    }
  };

  return (
    <div className="flex justify-center pt-43">
      <div className="w-full max-w-md px-6">
        <h1 className="text-4xl font-bold text-red-700 text-center mb-2 uppercase tracking-wide">
          Set Password
        </h1>
        <hr></hr>
        <p className="text-center text-sm text-gray-700 mt-2 mb-6">
          Let’s secure your account so you can start exploring opportunities
          with us.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="token" value={id} />
          <input
            type="password"
            placeholder="New Password"
            name="password"
            className="w-full px-4 py-3 border border-red-500 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            className="w-full px-4 py-3 border border-red-500 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <Button
            type="submit"
            className="flex justify-center items-center w-full bg-red-600 text-white font-bold px-4 py-3 rounded-md border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
          >
            SET PASSWORD
          </Button>
        </form>
      </div>
    </div>
  );
}
