import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";

import api from "../services/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function ResultsPage() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get("/elections").then((res) => {
      setElections(res.data);
      if (res.data.length) setSelectedElection(String(res.data[0].id));
    });
  }, []);

  useEffect(() => {
    if (!selectedElection) return;
    api.get(`/results?election_id=${selectedElection}`).then((res) => setResult(res.data));
  }, [selectedElection]);

  if (!result) return <p>Loading results...</p>;

  const labels = result.results.map((r) => r.candidate_name);
  const values = result.results.map((r) => r.votes);
  const colors = ["#6366f1", "#14b8a6", "#f59e0b", "#ef4444"];

  const chartData = {
    labels,
    datasets: [{ data: values, backgroundColor: labels.map((_, i) => colors[i % colors.length]) }],
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Live Results</h2>
          <select className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2" value={selectedElection} onChange={(e) => setSelectedElection(e.target.value)}>
            {elections.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-2 text-sm text-slate-400">Total votes: {result.total_votes}</p>
        <p className="text-sm text-emerald-300">Winner: {result.winner.length ? result.winner.join(", ") : "No winner yet"}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-3 font-semibold">Vote Distribution (Pie)</h3>
          <Pie data={chartData} />
        </div>
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-3 font-semibold">Vote Count (Bar)</h3>
          <Bar
            data={{
              labels,
              datasets: [{ label: "Votes", data: values, backgroundColor: "#6366f1" }],
            }}
          />
        </div>
      </div>
    </div>
  );
}
