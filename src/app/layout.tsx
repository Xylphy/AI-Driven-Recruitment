import type { Metadata } from "next";
import "./globals.css";
import Chatbot from "@/components/common/Chatbot";
import Footer from "@/components/common/Footer";
import LayoutVisibility from "@/components/common/LayoutVisibility";
import Navbar from "@/components/common/Navbar";
import { AuthProvider } from "@/context/AuthProvider";
import { TRPCProvider } from "@/lib/trpc/client";
import { poppins } from "@/styles/font";

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
				<TRPCProvider>
					<AuthProvider>
						<LayoutVisibility>
							<Navbar />
						</LayoutVisibility>

						<main className="grow">{children}</main>

						<LayoutVisibility>
							<Footer />
						</LayoutVisibility>
					</AuthProvider>
					<Chatbot />
				</TRPCProvider>
			</body>
		</html>
	);
}
