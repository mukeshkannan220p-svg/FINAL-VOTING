import { useState, useEffect } from "react";
import { X, Search, CheckCircle, ShieldAlert } from "lucide-react";
import adminApi from "../../services/adminApi";
import { motion, AnimatePresence } from "framer-motion";

export const AssignVotersModal = ({ isOpen, onClose, election }) => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRestricted, setIsRestricted] = useState(false);
  const [selectedVoterIds, setSelectedVoterIds] = useState(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && election) {
      // In a real app, we'd fetch the election's current restrictions.
      // For now, we assume if it's restricted, we fetch allowed voters.
      // Wait, the API doesn't return allowed_voters currently. 
      // We will just initialize with empty set and allow admin to save it.
      // Ideally, GET /elections would return is_restricted and allowed_voter_ids.
      // Let's fetch all approved voters.
      fetchApprovedVoters();
      setIsRestricted(election.is_restricted || false);
      setSelectedVoterIds(new Set(election.allowed_voter_ids || []));
    }
  }, [isOpen, election]);

  const fetchApprovedVoters = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get("/voters?approval_status=approved");
      setVoters(data);
    } catch (error) {
      console.error("Failed to fetch voters", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVoter = (id) => {
    const newSet = new Set(selectedVoterIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedVoterIds(newSet);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.post(`/elections/${election.id}/assign-voters`, {
        isRestricted,
        voterIds: Array.from(selectedVoterIds)
      });
      onClose();
    } catch (error) {
      console.error("Failed to save assignments", error);
    } finally {
      setSaving(false);
    }
  };

  const filteredVoters = voters.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.id_number && v.id_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-white">Election Access Control</h2>
              <p className="text-sm text-slate-400 mt-1">{election?.title}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 border-b border-slate-800 shrink-0 bg-slate-800/30">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isRestricted}
                onChange={(e) => setIsRestricted(e.target.checked)}
                className="w-5 h-5 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500 bg-slate-900"
              />
              <div>
                <p className="text-white font-medium">Restrict Access</p>
                <p className="text-sm text-slate-400">If checked, only selected voters can participate.</p>
              </div>
            </label>
          </div>

          {isRestricted && (
            <div className="p-6 flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="relative mb-4 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search approved voters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-[#1E293B] border border-slate-700 rounded-lg text-white w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="overflow-y-auto flex-1 border border-slate-800 rounded-xl bg-slate-900/50">
                {loading ? (
                  <div className="p-8 text-center text-slate-400">Loading voters...</div>
                ) : filteredVoters.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">No approved voters found.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-800 z-10">
                      <tr className="text-slate-400 text-sm">
                        <th className="p-3 font-medium w-12 text-center">Select</th>
                        <th className="p-3 font-medium">Name</th>
                        <th className="p-3 font-medium">ID No</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredVoters.map((voter) => (
                        <tr 
                          key={voter.id} 
                          className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${selectedVoterIds.has(voter.id) ? 'bg-indigo-500/10' : ''}`}
                          onClick={() => handleToggleVoter(voter.id)}
                        >
                          <td className="p-3 text-center">
                            <input 
                              type="checkbox" 
                              checked={selectedVoterIds.has(voter.id)}
                              onChange={() => {}} // handled by row click
                              className="w-4 h-4 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500 bg-slate-900 pointer-events-none"
                            />
                          </td>
                          <td className="p-3 text-white font-medium">{voter.name}</td>
                          <td className="p-3 text-slate-400 text-sm">{voter.id_number || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          <div className="p-6 border-t border-slate-800 flex justify-end gap-3 shrink-0">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? "Saving..." : "Save Access Settings"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
