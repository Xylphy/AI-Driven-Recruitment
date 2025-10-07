import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <AdminDashboard />
      </div>
    </div>
  );
}
