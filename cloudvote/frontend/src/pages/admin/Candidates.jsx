import { useState, useEffect } from "react";
import { Plus, Trash2, User } from "lucide-react";
import adminApi from "../../services/adminApi";

export const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    party: "",
    image: "",
    electionId: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [candidatesRes, electionsRes] = await Promise.all([
        adminApi.get("/candidates"),
        adminApi.get("/elections")
      ]);
      setCandidates(candidatesRes.data);
      setElections(electionsRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      await adminApi.post("/candidates", formData);
      setIsModalOpen(false);
      setFormData({ name: "", party: "", image: "", electionId: "" });
      fetchData();
    } catch (error) {
      console.error("Failed to add candidate", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      try {
        await adminApi.delete(`/candidates/${id}`);
        fetchData();
      } catch (error) {
        console.error("Failed to delete candidate", error);
      }
    }
  };

  if (loading) {
    return <div className="text-white text-center py-12">Loading candidates...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Candidates</h1>
          <p className="text-slate-400 mt-1">Manage candidates for all elections.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Add Candidate</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="bg-[#0F172A]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 relative group overflow-hidden">
            <button
              onClick={() => handleDelete(candidate.id)}
              className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center overflow-hidden mb-4 border-2 border-indigo-500/30">
                {candidate.image ? (
                  <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-500" />
                )}
              </div>
              <h3 className="text-lg font-bold text-white">{candidate.name}</h3>
              <p className="text-sm font-medium text-indigo-400 mt-1">{candidate.party || "Independent"}</p>
              <p className="text-xs text-slate-500 mt-3 bg-slate-800/50 px-3 py-1 rounded-full w-full truncate">
                {candidate.electionTitle}
              </p>
            </div>
          </div>
        ))}
        {candidates.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-[#0F172A]/50 rounded-2xl border border-slate-800 border-dashed">
            No candidates added yet.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Add Candidate</h2>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1E293B] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Party</label>
                <input
                  type="text"
                  value={formData.party}
                  onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1E293B] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1E293B] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Election</label>
                <select
                  required
                  value={formData.electionId}
                  onChange={(e) => setFormData({ ...formData, electionId: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1E293B] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select an election</option>
                  {elections.map((el) => (
                    <option key={el.id} value={el.id}>{el.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                >
                  Save Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
