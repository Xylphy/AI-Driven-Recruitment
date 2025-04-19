"use client";

import { Button } from "../../components/common/Button";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";

export default function Verification({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState("");
  const { id } = use(params);

  useEffect(() => {
    fetch("/api/csrf")
      .then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            setCsrfToken(data.csrfToken);
          });
        } else {
          console.error("Failed to fetch CSRF token");
        }
      })
      .catch((error) => {
        alert("Error fetching CSRF token:" + error);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      token: id,
      csrfToken: csrfToken,
    };

    const getEmail = await fetch

    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert("Password set successfully");
      router.push("/");
    } else {
      alert("Error setting password");
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
