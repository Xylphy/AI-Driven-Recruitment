import React from "react";

export const metadata = {
  title: "Login",
  description: "Login to your account",
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
