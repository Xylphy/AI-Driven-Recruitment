"use client";
import { BarChart2, Briefcase, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";

const navItems: { name: string; href: string; icon: ReactElement }[] = [
	{ name: "Jobs", href: "/admin/jobs", icon: <Briefcase /> },
	{ name: "Candidates", href: "/admin/candidates", icon: <Users /> },
	{ name: "Compare", href: "/admin/compare", icon: <BarChart2 /> },
];

export default function Sidebar() {
	const pathname = usePathname();

	return (
		<aside className="w-64 bg-white shadow-lg h-screen sticky top-0 flex flex-col">
			<div className="p-6 border-b">
				<h1 className="text-2xl font-bold text-red-600">Admin Panel</h1>
			</div>
			<nav className="flex-1 p-4 space-y-2">
				{navItems.map((item) => (
					<Link
						key={item.name}
						href={{ pathname: item.href }}
						className={`flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 font-medium transition-all ${
							pathname === item.href
								? "bg-red-100 text-red-600"
								: "hover:bg-gray-100"
						}`}
					>
						{item.icon}
						{item.name}
					</Link>
				))}
			</nav>
		</aside>
	);
}
