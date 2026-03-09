import type { Metadata } from "next";
import "./globals.css";
import Chatbot from "@/components/common/Chatbot";
import { AuthProvider } from "@/context/AuthProvider";
import { TRPCProvider } from "@/lib/trpc/client";
import { poppins } from "@/styles/font";
import AdminGate from "./role";
import AdminNavbar from "@/components/admin/AdminNavbar";

export const metadata: Metadata = {
  title: "AI-Driven Recruitment",
  description: "AI-Driven Recruitment",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo-red.png" />
      </head>

      <body
        className={`${poppins.className} antialiased min-h-screen flex flex-col`}
      >
        <TRPCProvider>
          <AuthProvider>
            <AdminGate>
              <AdminNavbar />
            </AdminGate>

            {children}
          </AuthProvider>

          <Chatbot />
        </TRPCProvider>
      </body>
    </html>
  );
}
