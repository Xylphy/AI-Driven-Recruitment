"use client";

import AdminGate from "../role";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminGate>
            <AdminNavbar>
              {children}
            </AdminNavbar>
                
         </AdminGate>;
}
