export default function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
      LIVE
    </span>
  );
}
