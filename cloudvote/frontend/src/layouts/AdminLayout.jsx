import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { AdminSidebar } from "../components/admin/AdminSidebar";

export const AdminLayout = () => {
  const { adminUser, loading } = useAdminAuth();

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">Loading...</div>;

  if (!adminUser || adminUser.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto relative">
        {/* Background gradient effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
