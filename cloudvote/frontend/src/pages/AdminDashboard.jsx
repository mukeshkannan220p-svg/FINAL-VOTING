import { useEffect, useState } from "react";

import ActivityList from "../components/ActivityList";
import LiveBadge from "../components/LiveBadge";
import StatCard from "../components/StatCard";
import api from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [elections, setElections] = useState([]);
  const [electionForm, setElectionForm] = useState({ title: "", description: "", start_date: "", end_date: "" });
  const [candidateForm, setCandidateForm] = useState({ election_id: "", name: "" });
  const [error, setError] = useState("");

  const load = async () => {
    const [statsRes, activityRes, electionsRes] = await Promise.all([
      api.get("/dashboard/stats"),
      api.get("/recent-activity"),
      api.get("/elections"),
    ]);
    setStats(statsRes.data);
    setActivity(activityRes.data);
    setElections(electionsRes.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const createElection = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/create-election", electionForm);
      setElectionForm({ title: "", description: "", start_date: "", end_date: "" });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create election");
    }
  };

  const addCandidate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/add-candidate", candidateForm);
      setCandidateForm({ election_id: "", name: "" });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add candidate");
    }
  };

  const action = async (endpoint, election_id) => {
    await api.post(endpoint, { election_id });
    await load();
  };

  const deleteElection = async (id) => {
    await api.delete(`/delete-election/${id}`);
    await load();
  };

  if (!stats) return <p>Loading admin dashboard...</p>;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard title="Total Voters" value={stats.total_users} />
        <StatCard title="Total Elections" value={stats.total_elections} />
        <StatCard title="Active Elections" value={stats.active_elections} />
        <StatCard title="Ended Elections" value={stats.ended_elections} />
        <StatCard title="Total Votes" value={stats.total_votes} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={createElection} className="glass rounded-2xl p-5">
          <h3 className="text-lg font-semibold">Create Election</h3>
          <input className="mt-3 w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2" placeholder="Title" value={electionForm.title} onChange={(e) => setElectionForm({ ...electionForm, title: e.target.value })} />
          <textarea className="mt-3 w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2" placeholder="Description" value={electionForm.description} onChange={(e) => setElectionForm({ ...electionForm, description: e.target.value })} />
          <input className="mt-3 w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2" type="datetime-local" value={electionForm.start_date} onChange={(e) => setElectionForm({ ...electionForm, start_date: e.target.value })} />
          <input className="mt-3 w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2" type="datetime-local" value={electionForm.end_date} onChange={(e) => setElectionForm({ ...electionForm, end_date: e.target.value })} />
          <button className="mt-4 rounded-lg bg-indigo-500 px-4 py-2 font-semibold hover:bg-indigo-400">Create</button>
        </form>

        <form onSubmit={addCandidate} className="glass rounded-2xl p-5">
          <h3 className="text-lg font-semibold">Add Candidate</h3>
          <select className="mt-3 w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2" value={candidateForm.election_id} onChange={(e) => setCandidateForm({ ...candidateForm, election_id: e.target.value })}>
            <option value="">Select Election</option>
            {elections.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
          <input className="mt-3 w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2" placeholder="Candidate Name" value={candidateForm.name} onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })} />
          <button className="mt-4 rounded-lg bg-violet-500 px-4 py-2 font-semibold hover:bg-violet-400">Add Candidate</button>
          {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <h3 className="text-xl font-semibold">Manage Elections</h3>
          {elections.map((election) => (
            <div key={election.id} className="glass rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-semibold">{election.title}</h4>
                  <p className="text-xs text-slate-400">{election.total_votes} votes · {election.candidate_count} candidates</p>
                </div>
                {election.status === "active" ? <LiveBadge /> : <span className="text-xs uppercase text-slate-400">{election.status}</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="rounded bg-emerald-600 px-3 py-1 text-xs" onClick={() => action("/start-election", election.id)}>Start</button>
                <button className="rounded bg-amber-600 px-3 py-1 text-xs" onClick={() => action("/end-election", election.id)}>End</button>
                <button className="rounded bg-rose-600 px-3 py-1 text-xs" onClick={() => deleteElection(election.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
        <ActivityList data={activity} />
      </div>
    </div>
  );
}
