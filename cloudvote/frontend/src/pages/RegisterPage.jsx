import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", id_number: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/register", form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
        <div className="glass w-full max-w-md rounded-2xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold">Registration Successful</h2>
          <p className="mb-6 text-slate-400">Your account is pending admin approval. You will be able to log in once an administrator approves your request.</p>
          <Link to="/login" className="inline-block w-full rounded-xl bg-indigo-500 py-3 font-semibold transition hover:bg-indigo-400">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
      <form onSubmit={submit} className="glass w-full max-w-md rounded-2xl p-8">
        <h2 className="text-2xl font-bold">Create Voter Account</h2>
        <p className="mb-6 mt-1 text-sm text-slate-400">Register to vote securely with Secure Web-Based Voting System</p>
        <input className="mb-3 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3" placeholder="Full Name" required onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="mb-3 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3" placeholder="ID Number" required onChange={(e) => setForm({ ...form, id_number: e.target.value })} />
        <input className="mb-3 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3" placeholder="Email" type="email" required onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="mb-3 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3" placeholder="Password" type="password" required onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}
        <button disabled={loading} className="w-full rounded-xl bg-indigo-500 py-3 font-semibold transition hover:bg-indigo-400 disabled:opacity-60">
          {loading ? "Creating account..." : "Register"}
        </button>
        <p className="mt-4 text-sm text-slate-400">
          Already registered? <Link to="/login" className="text-indigo-300">Login</Link>
        </p>
      </form>
    </div>
  );
}
