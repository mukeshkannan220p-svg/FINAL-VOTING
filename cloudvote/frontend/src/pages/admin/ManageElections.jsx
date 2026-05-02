import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Trash2, Play, Square, Users } from "lucide-react";
import adminApi from "../../services/adminApi";
import { AssignVotersModal } from "../../components/admin/AssignVotersModal";

export const ManageElections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const { data } = await adminApi.get("/elections");
      setElections(data);
    } catch (error) {
      console.error("Failed to fetch elections", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
      const action = currentStatus === "upcoming" || currentStatus === "completed" ? "start" : "end";
      await adminApi.post(`/elections/${id}/${action}`);
      fetchElections();
    } catch (error) {
      console.error("Failed to change status", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this election? All associated votes and candidates will be lost.")) {
      try {
        await adminApi.delete(`/elections/${id}`);
        fetchElections();
      } catch (error) {
        console.error("Failed to delete election", error);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-medium">Active</span>;
      case "upcoming":
        return <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium">Upcoming</span>;
      case "completed":
        return <span className="px-3 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full text-xs font-medium">Completed</span>;
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="text-white text-center py-12">Loading elections...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Elections</h1>
          <p className="text-slate-400 mt-1">Create, update, and monitor elections.</p>
        </div>
        <Link
          to="/admin/elections/create"
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>New Election</span>
        </Link>
      </div>

      <div className="bg-[#0F172A]/80 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-sm border-b border-slate-800">
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Start Date</th>
                <th className="p-4 font-medium">End Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Total Votes</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {elections.map((election) => (
                <tr key={election.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <p className="text-white font-medium">{election.title}</p>
                    <p className="text-slate-500 text-xs truncate max-w-xs">{election.description}</p>
                  </td>
                  <td className="p-4 text-slate-300 text-sm">{new Date(election.startDate).toLocaleDateString()}</td>
                  <td className="p-4 text-slate-300 text-sm">{new Date(election.endDate).toLocaleDateString()}</td>
                  <td className="p-4">{getStatusBadge(election.status)}</td>
                  <td className="p-4 text-slate-300 font-medium">{election.totalVotes}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-3">
                      {election.status === "upcoming" || election.status === "completed" ? (
                        <button
                          onClick={() => handleStatusChange(election.id, election.status)}
                          className="text-slate-400 hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-slate-800"
                          title="Start Election"
                        >
                          <Play className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(election.id, election.status)}
                          className="text-slate-400 hover:text-orange-400 transition-colors p-2 rounded-lg hover:bg-slate-800"
                          title="End Election"
                        >
                          <Square className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedElection(election);
                          setIsAssignModalOpen(true);
                        }}
                        className="text-slate-400 hover:text-indigo-400 transition-colors p-2 rounded-lg hover:bg-slate-800"
                        title="Manage Access"
                      >
                        <Users className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(election.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-slate-800"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {elections.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No elections found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <AssignVotersModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        election={selectedElection}
      />
    </div>
  );
};
