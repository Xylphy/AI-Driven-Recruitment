"use client";

import {
  createUserWithEmailAndPassword,
  deleteUser,
  isSignInWithEmailLink,
} from "firebase/auth";
import { Button } from "@/components/common/Button";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { auth } from "@/lib/firebase/client";
import { getCsrfToken } from "@/lib/library";

export default function Verification({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { id } = use(params);

  useEffect(() => {
    getCsrfToken().then(setCsrfToken);
  }, []);

  useEffect(() => {
    if (!csrfToken) {
      return;
    }

    const fetchData = async () => {
      try {
        const emailResponse = await fetch("/api/users/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          body: JSON.stringify({ id }),
        });

        if (!emailResponse.ok) {
          alert("Verification expired");
          router.push("/signup");
          return;
        }
        setEmail(await emailResponse.json());
      } catch (error) {
        if (error instanceof Error) {
          alert("Error: " + error.message);
        } else {
          alert("An unknown error occurred");
        }
      }
    };

    fetchData();
  }, [id, router, csrfToken]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!csrfToken) {
      alert("CSRF token not found");
      return;
    }

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

      if (!email) {
        alert("Email not found");
        router.push("/signup");
        return;
      }

      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        (data.password as string).trim()
      );

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ ...data, uid: userCredential.user.uid }),
      });

      if (response.ok) {
        alert("Password set successfully");
        router.push("/login");
      } else {
        await deleteUser(userCredential.user);
        response.json().then((errorData) => alert("Error: " + errorData.error));
      }
      setIsLoading(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert("Error signing in with email link: " + error.message);
      } else {
        alert("An unknown error occurred");
      }
      setIsLoading(false);
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
            minLength={8}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            className="w-full px-4 py-3 border border-red-500 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            minLength={8}
            required
          />
          {email && !isLoading ? (
            <Button
              type="submit"
              className="flex justify-center items-center w-full bg-red-600 text-white font-bold px-4 py-3 rounded-md border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
            >
              SET PASSWORD
            </Button>
          ) : (
            <Button
              type="button"
              disabled
              className="flex justify-center items-center w-full bg-gray-400 text-white font-bold px-4 py-3 rounded-md border border-transparent"
            >
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              LOADING...
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
