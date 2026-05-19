import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Users, FileText, CheckCircle, Clock } from "lucide-react";
import adminApi from "../../services/adminApi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalElections: 0,
    activeElections: 0,
    totalVotes: 0,
    registeredVoters: 0,
    pendingApprovals: 0,
    approvedVoters: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await adminApi.get("/dashboard-stats");
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Registered Users", value: stats.registeredVoters, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Pending Approvals", value: stats.pendingApprovals, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
    { title: "Approved Voters", value: stats.approvedVoters, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { title: "Total Votes Cast", value: stats.totalVotes, icon: FileText, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  const barData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Votes Cast",
        data: [12, 19, 3, 5, 2, 3, 10], // Dummy data for visual
        backgroundColor: "rgba(99, 102, 241, 0.5)",
        borderColor: "rgb(99, 102, 241)",
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
    },
    scales: {
      y: { grid: { color: "rgba(255, 255, 255, 0.1)" }, ticks: { color: "#94a3b8" } },
      x: { grid: { display: false }, ticks: { color: "#94a3b8" } }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1">Real-time statistics and activity for Secure Web-Based Voting System.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-[#0F172A]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110`} />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                <h3 className="text-3xl font-bold text-white mt-2">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0F172A]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Voting Activity (Last 7 Days)</h3>
          <div className="h-[300px]">
            <Bar options={barOptions} data={barData} />
          </div>
        </div>
        <div className="bg-[#0F172A]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 text-sm">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0" />
              <div>
                <p className="text-slate-200">New election "Student Council" started</p>
                <p className="text-slate-500 text-xs mt-0.5">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 text-sm">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 shrink-0" />
              <div>
                <p className="text-slate-200">User Aarav Sharma registered</p>
                <p className="text-slate-500 text-xs mt-0.5">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 text-sm">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-purple-500 shrink-0" />
              <div>
                <p className="text-slate-200">Vote milestone: 1,000 votes reached</p>
                <p className="text-slate-500 text-xs mt-0.5">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
