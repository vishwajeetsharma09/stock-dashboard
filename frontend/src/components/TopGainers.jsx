import { useEffect, useState } from "react";
import { getGainersLosers } from "../api/stockApi.js";

export default function TopGainers() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: res } = await getGainersLosers();
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-xl bg-slate-800 p-4 text-sm text-red-400 shadow-lg">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl bg-slate-800 p-4 shadow-lg">
        <div className="h-8 animate-pulse rounded bg-slate-700" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-slate-800 p-4 shadow-lg md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <span className="mr-2 font-semibold text-green-400">🟢 Top Gainers</span>
        {data.top_gainers?.map((g) => (
          <span
            key={g.symbol}
            className="inline-flex items-center rounded-full bg-green-900/50 px-3 py-1 text-sm font-medium text-green-300 ring-1 ring-green-700/50"
          >
            {g.symbol}{" "}
            <span className="ml-1 text-green-200">
              {Number(g.daily_return).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
      <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
        <span className="mr-2 font-semibold text-red-400">🔴 Top Losers</span>
        {data.top_losers?.map((l) => (
          <span
            key={l.symbol}
            className="inline-flex items-center rounded-full bg-red-900/50 px-3 py-1 text-sm font-medium text-red-300 ring-1 ring-red-700/50"
          >
            {l.symbol}{" "}
            <span className="ml-1 text-red-200">
              {Number(l.daily_return).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
