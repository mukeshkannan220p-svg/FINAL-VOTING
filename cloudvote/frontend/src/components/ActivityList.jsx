export default function ActivityList({ data }) {
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-lg font-semibold">Recent Activity</h3>
      <div className="mt-4 space-y-3">
        {data.map((item, idx) => (
          <div key={`${item.timestamp}-${idx}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-sm text-slate-200">{item.message}</p>
            <p className="mt-1 text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
