import type { Metadata } from "next";
import { poppins } from "../styles/fonts";
import "./globals.css";
import ClientProviders from "@/components/providers/ClientProviders";

export const metadata: Metadata = {
  title: "AI-Driven Recruitment",
  description: "AI-Driven Recruitment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo-red.png" />
      </head>
      <body
        className={`${poppins.className} antialiased min-h-screen flex flex-col`}
      >
        <ClientProviders>
          <main className="flex-grow">{children}</main>
        </ClientProviders>
      </body>
    </html>
  );
}
