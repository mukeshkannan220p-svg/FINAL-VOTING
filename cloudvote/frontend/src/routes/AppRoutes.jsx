import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { useAdminAuth } from "../context/AdminAuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { AdminLogin } from "../pages/admin/AdminLogin";
import { Dashboard as AdminDashboard } from "../pages/admin/Dashboard";
import { ManageElections } from "../pages/admin/ManageElections";
import { CreateElection } from "../pages/admin/CreateElection";
import { Candidates } from "../pages/admin/Candidates";
import { LiveVoting } from "../pages/admin/LiveVoting";
import { Results } from "../pages/admin/Results";
import { Voters } from "../pages/admin/Voters";
import { Announcements } from "../pages/admin/Announcements";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ResultsPage from "../pages/ResultsPage";
import VotePage from "../pages/VotePage";
import VoterDashboard from "../pages/VoterDashboard";

function HomeRedirect() {
  const { user } = useAuth();
  const { adminUser } = useAdminAuth();

  if (adminUser?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (user) return <Navigate to="/dashboard" replace />;

  return <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route element={<ProtectedRoute roles={["voter"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<VoterDashboard />} />
          <Route path="/vote/:electionId" element={<VotePage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Route>
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="elections" element={<ManageElections />} />
        <Route path="elections/create" element={<CreateElection />} />
        <Route path="candidates" element={<Candidates />} />
        <Route path="live" element={<LiveVoting />} />
        <Route path="results" element={<Results />} />
        <Route path="voters" element={<Voters />} />
        <Route path="announcements" element={<Announcements />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
