import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";

export default function VotePage() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/elections").then((res) => {
      const found = res.data.find((e) => String(e.id) === electionId);
      setElection(found || null);
    });
  }, [electionId]);

  const submitVote = async () => {
    if (!selectedCandidate || !election) return;
    setSubmitting(true);
    setMessage("");
    try {
      await api.post("/vote", { election_id: election.id, candidate_id: selectedCandidate });
      setMessage("Vote submitted successfully.");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to submit vote");
    } finally {
      setSubmitting(false);
    }
  };

  if (!election) return <p>Loading election...</p>;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="glass rounded-2xl p-6">
        <h2 className="text-2xl font-bold">{election.title}</h2>
        <p className="mt-1 text-sm text-slate-400">{election.description}</p>
        <p className="mt-3 inline-block rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
          Your vote is securely encrypted
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {election.candidates.map((candidate) => (
          <button
            type="button"
            key={candidate.id}
            onClick={() => setSelectedCandidate(candidate.id)}
            className={`glass rounded-2xl p-5 text-left transition ${selectedCandidate === candidate.id ? "ring-2 ring-indigo-400" : "hover:bg-white/10"}`}
          >
            <h3 className="font-semibold">{candidate.name}</h3>
            <p className="mt-1 text-xs text-slate-400">Candidate ID: {candidate.id}</p>
          </button>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(99,102,241,0.6)" }}
        whileTap={{ scale: 0.96 }}
        disabled={submitting || election.has_voted}
        onClick={submitVote}
        className="w-full rounded-xl bg-indigo-500 px-6 py-4 text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {election.has_voted ? "Vote Already Submitted" : submitting ? "Submitting Vote..." : "Submit Vote"}
      </motion.button>
      {message ? <p className="text-center text-sm text-emerald-300">{message}</p> : null}
    </div>
  );
}
