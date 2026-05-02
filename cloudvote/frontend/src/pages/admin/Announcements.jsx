import { useState, useEffect } from "react";
import { Megaphone, Send } from "lucide-react";
import adminApi from "../../services/adminApi";

export const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await adminApi.get("/announcements");
      setAnnouncements(data);
    } catch (error) {
      console.error("Failed to fetch announcements", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setSubmitting(true);
    try {
      await adminApi.post("/announcements", { message });
      setMessage("");
      fetchAnnouncements();
    } catch (error) {
      console.error("Failed to post announcement", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-white text-center py-12">Loading announcements...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
          <Megaphone className="w-8 h-8 text-indigo-400" />
          <span>Announcements</span>
        </h1>
        <p className="text-slate-400 mt-1">Publish system-wide notices to all voters.</p>
      </div>

      <div className="bg-[#0F172A]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Post New Announcement</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="E.g., 'Voting for Student Council closes in 2 hours!'"
              className="w-full px-4 py-3 bg-[#1E293B] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500 resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !message.trim()}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Publish Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white mb-4">Recent Announcements</h2>
        {announcements.map((announcement) => (
          <div key={announcement.id} className="bg-[#1E293B]/50 border border-slate-800 rounded-xl p-5">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0 mt-1">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{announcement.message}</p>
                <p className="text-xs text-slate-500 mt-3 font-medium">
                  {new Date(announcement.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center py-12 text-slate-500 border border-slate-800 border-dashed rounded-xl">
            No announcements published yet.
          </div>
        )}
      </div>
    </div>
  );
};
