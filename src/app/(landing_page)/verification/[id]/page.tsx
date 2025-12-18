"use client";

import {
  createUserWithEmailAndPassword,
  deleteUser,
  isSignInWithEmailLink,
} from "firebase/auth";
import { Button } from "@/components/common/Button";
import { useParams, useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { auth } from "@/lib/firebase/client";
import { trpc } from "@/lib/trpc/client";

export default function Verification() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const id = useParams().id as string; // MongoDB ObjectId
  const [email, setEmail] = useState<string | null>(null);
  const verificationMutation = trpc.user.verifyUser.useMutation();

  const {
    data,
    isLoading: isEmailLoading,
    error,
  } = trpc.user.fetchEmail.useQuery({ uid: id }, { enabled: !!id });

  useEffect(() => {
    if (data?.email) {
      startTransition(() => setEmail(data.email));
    }

    if (error) {
      alert("Error: " + error.message);
      router.push("/signup");
    }
  }, [data, error, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      alert("Email not found");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (!isSignInWithEmailLink(auth, window.location.href)) {
      alert("Invalid link");
      return;
    }

    try {
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        (password as string).trim()
      );

      await verificationMutation.mutateAsync(
        {
          password: password as string,
          confirmPassword: confirmPassword as string,
          token: id,
          uid: userCredential.user.uid,
        },
        {
          onSuccess: () => {
            alert("User verified successfully");
            router.push("/login");
          },
          onError: async (mutationError) => {
            alert("Error: " + mutationError.message);
            // Delete the created user if verification fails
            const currentUser = auth.currentUser;
            if (currentUser) {
              await deleteUser(currentUser);
            }
          },
          onSettled: () => {
            setIsLoading(false);
          },
        }
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert("Error signing in with email link: " + error.message);
      } else {
        alert("An unknown error occurred");
      }
      setIsLoading(false);
    }
  };
  if (isEmailLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg
          className="animate-spin h-10 w-10 text-red-600"
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
      </div>
    );
  }

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
          {!isLoading ? (
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
