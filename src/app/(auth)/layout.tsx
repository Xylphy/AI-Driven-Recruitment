import React from "react";

export const metadata = {
  title: "Signup",
  description: "Create an account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex justify-center pt-10">
        <div className="w-full max-w-2xl px-6">{children}</div>
      </div>
    </>
  );
}
