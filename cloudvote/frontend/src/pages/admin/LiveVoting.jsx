import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Radio } from "lucide-react";
import adminApi from "../../services/adminApi";

export const LiveVoting = () => {
  const [activeElections, setActiveElections] = useState([]);
  const [electionData, setElectionData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveElections();
    
    // Poll every 5 seconds
    const interval = setInterval(fetchActiveElections, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveElections = async () => {
    try {
      const { data } = await adminApi.get("/elections");
      const active = data.filter(e => e.status === "active");
      setActiveElections(active);
      
      // Fetch live data for each active election
      const dataMap = {};
      for (const election of active) {
        const liveRes = await adminApi.get(`/elections/${election.id}/live`);
        dataMap[election.id] = liveRes.data;
      }
      setElectionData(dataMap);
    } catch (error) {
      console.error("Failed to fetch live data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white text-center py-12">Loading live data...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-[#0F172A]/80 backdrop-blur-md border border-indigo-500/30 p-6 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.1)]">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <Radio className="w-8 h-8 text-indigo-400" />
            <span>Live Voting Monitor</span>
          </h1>
          <p className="text-slate-400 mt-1">Real-time updates from active polling stations.</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
          <span className="text-green-400 font-bold tracking-widest text-sm">LIVE</span>
        </div>
      </div>

      {activeElections.length === 0 ? (
        <div className="text-center py-20 bg-[#0F172A]/50 rounded-2xl border border-slate-800">
          <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-400">No Active Elections</h3>
          <p className="text-slate-500 mt-2">Start an election from the Manage Elections tab to see live data here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {activeElections.map(election => {
            const data = electionData[election.id];
            if (!data) return null;
            
            // Sort candidates by votes
            const sortedCandidates = [...data.candidates].sort((a, b) => b.votes - a.votes);
            const totalVotes = data.totalVotes || 1; // avoid division by zero
            const maxVotes = sortedCandidates[0]?.votes || 0;

            return (
              <motion.div
                key={election.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0F172A]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 pb-6 border-b border-slate-800">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{election.title}</h2>
                    <p className="text-slate-400 mt-1">Total Votes Cast: <span className="text-white font-bold text-lg ml-1">{data.totalVotes}</span></p>
                  </div>
                </div>

                <div className="space-y-6">
                  {sortedCandidates.map((candidate, index) => {
                    const percentage = Math.round((candidate.votes / totalVotes) * 100);
                    const isLeading = candidate.votes === maxVotes && maxVotes > 0;
                    
                    return (
                      <div key={candidate.id} className="relative">
                        <div className="flex justify-between items-end mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-slate-500 font-medium text-sm w-4">{index + 1}.</span>
                            <span className="text-white font-medium text-lg">{candidate.name}</span>
                            {isLeading && (
                              <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase rounded border border-yellow-500/20">
                                Leading
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-bold text-white">{candidate.votes}</span>
                            <span className="text-slate-500 text-sm ml-2">({percentage}%)</span>
                          </div>
                        </div>
                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${isLeading ? 'bg-indigo-500' : 'bg-slate-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
