import type React from "react";

export const metadata = {
  title: "About Us",
  description: "About us",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full flex items-center justify-center">
      <div className="p-6 bg-white rounded">{children}</div>
    </div>
  );
}
