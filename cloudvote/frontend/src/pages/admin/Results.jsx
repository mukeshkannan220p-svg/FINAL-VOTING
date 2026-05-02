import { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Download, Trophy } from "lucide-react";
import adminApi from "../../services/adminApi";

export const Results = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const { data } = await adminApi.get("/elections");
      const completedOrActive = data.filter(e => e.status !== "upcoming");
      setElections(completedOrActive);
      if (completedOrActive.length > 0) {
        handleSelectElection(completedOrActive[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch elections", error);
      setLoading(false);
    }
  };

  const handleSelectElection = async (id) => {
    setSelectedElection(id);
    setLoading(true);
    try {
      const { data } = await adminApi.get(`/elections/${id}/live`);
      setResultsData(data);
    } catch (error) {
      console.error("Failed to fetch results", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!resultsData) return;

    const headers = ["Candidate Name", "Party", "Votes"];
    const rows = resultsData.candidates.map(c => [c.name, c.party || "Independent", c.votes]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${resultsData.title}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !resultsData) {
    return <div className="text-white text-center py-12">Loading results...</div>;
  }

  const chartData = resultsData ? {
    labels: resultsData.candidates.map(c => c.name),
    datasets: [
      {
        data: resultsData.candidates.map(c => c.votes),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderColor: '#0F172A',
        borderWidth: 2,
      },
    ],
  } : null;

  const sortedCandidates = resultsData ? [...resultsData.candidates].sort((a, b) => b.votes - a.votes) : [];
  const winner = sortedCandidates.length > 0 ? sortedCandidates[0] : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Election Results</h1>
          <p className="text-slate-400 mt-1">Detailed breakdown and analytics.</p>
        </div>
        
        {elections.length > 0 && (
          <div className="flex space-x-3">
            <select
              value={selectedElection || ""}
              onChange={(e) => handleSelectElection(e.target.value)}
              className="bg-[#1E293B] border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
            >
              {elections.map(e => (
                <option key={e.id} value={e.id}>{e.title} ({e.status})</option>
              ))}
            </select>
            
            <button
              onClick={handleExportCSV}
              disabled={!resultsData}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors border border-slate-700 disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>Export CSV</span>
            </button>
          </div>
        )}
      </div>

      {!resultsData ? (
        <div className="text-center py-20 bg-[#0F172A]/50 rounded-2xl border border-slate-800">
          <p className="text-slate-500">No results available. Ensure elections have started or completed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 rounded-2xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 text-yellow-500 mb-4">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-indigo-200">Current Leader / Winner</h3>
              {winner && winner.votes > 0 ? (
                <>
                  <p className="text-3xl font-bold text-white mt-2">{winner.name}</p>
                  <p className="text-indigo-300 mt-1">{winner.party}</p>
                  <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 mt-4">
                    {winner.votes} <span className="text-lg font-medium text-yellow-500/70">Votes</span>
                  </p>
                </>
              ) : (
                <p className="text-white mt-2">No votes cast yet.</p>
              )}
            </div>

            <div className="bg-[#0F172A]/80 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Turnout:</span>
                  <span className="text-white font-bold">{resultsData.totalVotes} votes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-white font-bold capitalize">{resultsData.status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0F172A]/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px]">
              <h3 className="text-lg font-medium text-white mb-6 self-start w-full text-center">Vote Distribution</h3>
              <div className="w-full max-w-[250px] aspect-square">
                {resultsData.totalVotes > 0 ? (
                  <Doughnut 
                    data={chartData} 
                    options={{ 
                      cutout: '70%',
                      plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1' } } }
                    }} 
                  />
                ) : (
                  <div className="w-full h-full rounded-full border-8 border-slate-800 flex items-center justify-center">
                    <span className="text-slate-600">0 Votes</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#0F172A]/80 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-white mb-6">Detailed Standings</h3>
              <div className="space-y-4">
                {sortedCandidates.map((candidate, idx) => (
                  <div key={candidate.id} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-500 font-medium">{idx + 1}.</span>
                      <div>
                        <p className="text-white font-medium">{candidate.name}</p>
                        <p className="text-xs text-slate-400">{candidate.party}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{candidate.votes}</p>
                      <p className="text-xs text-slate-500">
                        {resultsData.totalVotes > 0 ? Math.round((candidate.votes / resultsData.totalVotes) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
