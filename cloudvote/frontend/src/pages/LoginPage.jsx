import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function LoginPage({ admin = false }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const endpoint = admin ? "/admin/login" : "/login";

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post(endpoint, form);
      login(data.token, data.user);
      navigate(admin ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
      <form onSubmit={submit} className="glass w-full max-w-md rounded-2xl p-8">
        <h2 className="text-2xl font-bold">{admin ? "Admin Login" : "Voter Login"}</h2>
        <p className="mb-6 mt-1 text-sm text-slate-400">Access your Secure Web-Based Voting System account</p>
        <input className="mb-3 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3" placeholder="Email" type="email" required onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="mb-3 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3" placeholder="Password" type="password" required onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}
        <button disabled={loading} className="w-full rounded-xl bg-indigo-500 py-3 font-semibold transition hover:bg-indigo-400 disabled:opacity-60">
          {loading ? "Please wait..." : "Login"}
        </button>
        {!admin ? (
          <div className="mt-4 flex flex-col items-center justify-between space-y-3 sm:flex-row sm:space-y-0 text-sm text-slate-400">
            <span>New voter? <Link to="/register" className="text-indigo-300 hover:text-indigo-200 transition-colors">Create account</Link></span>
            <Link to="/admin/login" className="text-slate-400 hover:text-indigo-300 transition-colors">Go to Admin Portal &rarr;</Link>
          </div>
        ) : null}
      </form>
    </div>
  );
}
