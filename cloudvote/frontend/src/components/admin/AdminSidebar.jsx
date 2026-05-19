import { NavLink } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  Settings,
  Users,
  BarChart,
  LogOut,
  Radio,
  FileText,
  Bell
} from "lucide-react";

export const AdminSidebar = () => {
  const { logout } = useAdminAuth();

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Create Election", path: "/admin/elections/create", icon: PlusCircle },
    { name: "Manage Elections", path: "/admin/elections", icon: Settings },
    { name: "Candidates", path: "/admin/candidates", icon: Users },
    { name: "Live Voting", path: "/admin/live", icon: Radio },
    { name: "Results", path: "/admin/results", icon: BarChart },
    { name: "User Approvals", path: "/admin/voters", icon: Users },
    { name: "Announcements", path: "/admin/announcements", icon: Bell },
  ];

  return (
    <div className="w-64 min-h-screen bg-[#0F172A] border-r border-slate-800 flex flex-col font-sans">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          Secure Web-Based Voting System Admin
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-400 font-medium"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
                <span className="relative z-10">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-indigo-600/10 rounded-lg border border-indigo-500/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
