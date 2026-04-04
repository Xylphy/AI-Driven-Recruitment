"use client";

import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminGate from "../role";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGate>
      <AdminNavbar>{children}</AdminNavbar>
    </AdminGate>
  );
}
