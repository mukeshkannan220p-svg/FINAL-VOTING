import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ShieldCheck } from "lucide-react";

export const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, adminUser } = useAdminAuth();
  const navigate = useNavigate();

  if (adminUser?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate("/admin/dashboard");
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="bg-[#0F172A]/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Admin Portal</h1>
            <p className="text-slate-400">Sign in to manage Secure Web-Based Voting System securely.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-[#1E293B] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-500"
                placeholder="admin@cloudvote.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-[#1E293B] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm font-medium bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Secure Login</span>
              )}
            </button>
            <div className="mt-6 text-center text-sm text-slate-400">
               <Link to="/login" className="text-slate-400 hover:text-indigo-400 transition-colors">&larr; Return to Voter Login</Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
