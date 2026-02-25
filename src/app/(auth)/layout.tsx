import type React from "react";

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
    <div className="min-h-screen w-full flex flex-col overflow-hidden">
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-3xl">{children}</div>
      </main>
    </div>
  );
}
