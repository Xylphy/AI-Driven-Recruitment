import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
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

const NavbarFallback = () => (
	<nav className="bg-white text-black shadow-md">
		<div className="container mx-auto px-4 py-3 flex justify-between items-center">
			<div className="h-8 w-28 bg-gray-200 rounded animate-pulse" />
			<div className="flex items-center gap-4">
				<div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse" />
				<div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
			</div>
		</div>
	</nav>
);

const FooterFallback = () => (
	<footer className="bg-gray-900 text-white py-8 px-6">
		<div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
			<div className="flex items-center gap-4">
				<div className="h-12 w-12 bg-gray-700 rounded animate-pulse" />
				<div className="space-y-2">
					<div className="h-3 w-40 bg-gray-700 rounded animate-pulse" />
					<div className="h-3 w-32 bg-gray-700 rounded animate-pulse" />
					<div className="h-3 w-36 bg-gray-700 rounded animate-pulse" />
				</div>
			</div>
			<div className="grid grid-cols-2 gap-2">
				<div className="h-3 w-24 bg-gray-700 rounded animate-pulse" />
				<div className="h-3 w-24 bg-gray-700 rounded animate-pulse" />
				<div className="h-3 w-24 bg-gray-700 rounded animate-pulse" />
				<div className="h-3 w-24 bg-gray-700 rounded animate-pulse" />
			</div>
		</div>
	</footer>
);
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
						<Suspense fallback={NavbarFallback()}>
							<LayoutVisibility>
								<Navbar />
							</LayoutVisibility>
						</Suspense>

						<main className="grow">{children}</main>

						<Suspense fallback={FooterFallback()}>
							<LayoutVisibility>
								<Footer />
							</LayoutVisibility>
						</Suspense>
					</AuthProvider>
					<Chatbot />
				</TRPCProvider>
			</body>
		</html>
	);
}
