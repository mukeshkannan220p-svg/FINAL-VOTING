import { useEffect, useState } from "react";

function getDiff(target) {
  const now = new Date().getTime();
  const diff = Math.max(target - now, 0);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds, done: diff <= 0 };
}

export default function CountdownTimer({ endDate }) {
  const target = new Date(endDate).getTime();
  const [time, setTime] = useState(getDiff(target));

  useEffect(() => {
    const id = setInterval(() => setTime(getDiff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (time.done) return <span className="text-xs text-rose-300">Ended</span>;
  return (
    <span className="text-xs text-slate-300">
      {String(time.hours).padStart(2, "0")}h:{String(time.minutes).padStart(2, "0")}m:{String(time.seconds).padStart(2, "0")}s
    </span>
  );
}
