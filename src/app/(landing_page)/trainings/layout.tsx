import type React from "react";

export const metadata = {
  title: "Trainings",
  description: "trainings",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded shadow-md">
        {children}
      </div>
    </div>
  );
}
