"use client";

import { usePathname } from "next/navigation";

export default function LayoutVisibility({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAdminRoute = pathname.startsWith("/admin");

  return <>{!isAdminRoute && children}</>;
}
