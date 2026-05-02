import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Search, Upload, UserCheck, Clock, UserX } from "lucide-react";
import adminApi from "../../services/adminApi";
import { CsvUploadModal } from "../../components/admin/CsvUploadModal";

export const Voters = () => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  useEffect(() => {
    fetchVoters();
  }, []);

  const fetchVoters = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get("/voters");
      setVoters(data);
    } catch (error) {
      console.error("Failed to fetch voters", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (voterId) => {
    try {
      await adminApi.post(`/voters/${voterId}/approve`);
      fetchVoters();
    } catch (error) {
      console.error(`Failed to approve voter`, error);
    }
  };

  const handleReject = async (voterId) => {
    try {
      await adminApi.post(`/voters/${voterId}/reject`);
      fetchVoters();
    } catch (error) {
      console.error(`Failed to reject voter`, error);
    }
  };

  const filteredVoters = voters.filter(v => 
    v.approval_status === activeTab &&
    (v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (v.id_number && v.id_number.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const pendingCount = voters.filter(v => v.approval_status === "pending").length;
  const approvedCount = voters.filter(v => v.approval_status === "approved").length;
  const rejectedCount = voters.filter(v => v.approval_status === "rejected").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">User Approvals</h1>
          <p className="text-slate-400 mt-1">Manage voter registrations and bulk imports.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[#1E293B] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
            />
          </div>
          <button 
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Upload className="w-5 h-5" />
            <span>Import CSV</span>
          </button>
        </div>
      </div>

      <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700 w-full max-w-md">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'pending' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Clock className="w-4 h-4" /> Pending ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'approved' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <UserCheck className="w-4 h-4" /> Approved ({approvedCount})
        </button>
        <button
          onClick={() => setActiveTab("rejected")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'rejected' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <UserX className="w-4 h-4" /> Rejected ({rejectedCount})
        </button>
      </div>

      <div className="bg-[#0F172A]/80 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-white text-center py-12">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 text-slate-400 text-sm border-b border-slate-800">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">ID Number</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredVoters.map((voter) => (
                  <tr key={voter.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-white font-medium">{voter.name}</td>
                    <td className="p-4 text-slate-300 text-sm">{voter.id_number || '-'}</td>
                    <td className="p-4 text-slate-300 text-sm">{voter.email}</td>
                    <td className="p-4 text-center">
                      {voter.approval_status === "approved" && <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">Approved</span>}
                      {voter.approval_status === "pending" && <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-medium">Pending</span>}
                      {voter.approval_status === "rejected" && <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-xs font-medium">Rejected</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {voter.approval_status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(voter.id)}
                              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium text-emerald-400 hover:bg-emerald-400/10 border border-transparent hover:border-emerald-400/20 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReject(voter.id)}
                              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-400/10 border border-transparent hover:border-rose-400/20 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        {voter.approval_status === "approved" && (
                           <button
                             onClick={() => handleReject(voter.id)}
                             className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-400/10 border border-transparent hover:border-rose-400/20 transition-colors"
                           >
                             <UserX className="w-4 h-4" />
                             <span>Revoke Access</span>
                           </button>
                        )}
                        {voter.approval_status === "rejected" && (
                           <button
                             onClick={() => handleApprove(voter.id)}
                             className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium text-emerald-400 hover:bg-emerald-400/10 border border-transparent hover:border-emerald-400/20 transition-colors"
                           >
                             <UserCheck className="w-4 h-4" />
                             <span>Restore Access</span>
                           </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredVoters.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">
                      No users found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CsvUploadModal 
        isOpen={isCsvModalOpen} 
        onClose={() => setIsCsvModalOpen(false)} 
        onSuccess={() => {
          fetchVoters();
          setActiveTab("approved");
        }} 
      />
    </div>
  );
};
