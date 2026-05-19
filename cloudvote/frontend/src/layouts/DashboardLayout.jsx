import { Link, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate(user?.role === "admin" ? "/admin/login" : "/login");
  };

  const navLinks =
    user?.role === "admin"
      ? [
          { to: "/admin/dashboard", label: "Dashboard" },
          { to: "/admin/results", label: "Results" },
        ]
      : [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/results", label: "Results" },
        ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">Secure Web-Based Voting System</h1>
            <p className="text-xs text-slate-400">Secure Online Voting Platform</p>
          </div>
          <div className="flex items-center gap-3">
            {navLinks.map((link) => (
              <Link key={link.to} className="rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/10" to={link.to}>
                {link.label}
              </Link>
            ))}
            <button className="rounded-lg bg-rose-500/80 px-3 py-2 text-sm hover:bg-rose-500" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
