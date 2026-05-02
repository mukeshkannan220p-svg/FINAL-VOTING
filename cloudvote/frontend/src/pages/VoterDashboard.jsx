import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ActivityList from "../components/ActivityList";
import CountdownTimer from "../components/CountdownTimer";
import LiveBadge from "../components/LiveBadge";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function VoterDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [elections, setElections] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const load = async () => {
    const [statsRes, activityRes, electionsRes, announcementsRes] = await Promise.all([
      api.get("/dashboard/stats"),
      api.get("/recent-activity"),
      api.get("/elections"),
      api.get("/admin/announcements").catch(() => ({ data: [] })),
    ]);
    setStats(statsRes.data);
    setActivity(activityRes.data);
    setElections(electionsRes.data);
    setAnnouncements(announcementsRes.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  if (!stats) return <p>Loading dashboard...</p>;
  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <h2 className="text-2xl font-bold">Welcome, {user?.name}</h2>
        <p className="mt-1 text-slate-400">Track your elections and cast your vote securely.</p>
      </div>

      {announcements.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-4 flex items-start space-x-3 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider text-indigo-300">Latest Announcement</h3>
            <p className="text-slate-200 text-sm leading-relaxed">{announcements[0].message}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Elections" value={stats.total_elections} />
        <StatCard title="Votes Completed" value={stats.votes_completed} />
        <StatCard title="Pending Votes" value={stats.pending_votes} />
        <StatCard title="Voting Status" value={stats.voting_status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <h3 className="text-xl font-semibold">Active Elections</h3>
          {elections
            .filter((e) => e.status === "active")
            .map((election) => (
              <div key={election.id} className="glass rounded-2xl p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-semibold">{election.title}</h4>
                  <LiveBadge />
                </div>
                <p className="text-sm text-slate-400">{election.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <CountdownTimer endDate={election.end_date} />
                  <Link
                    to={`/vote/${election.id}`}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${election.has_voted ? "bg-slate-700 text-slate-300 pointer-events-none" : "bg-indigo-500 hover:bg-indigo-400"}`}
                  >
                    {election.has_voted ? "Vote Submitted" : "Vote Now"}
                  </Link>
                </div>
              </div>
            ))}
        </div>
        <ActivityList data={activity} />
      </div>
    </div>
  );
}
