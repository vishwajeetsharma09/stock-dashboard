import { useEffect, useState } from "react";
import { getSummary } from "../api/stockApi.js";

function fmtPrice(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return "—";
  return `₹${x.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function fmtPct(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return "—";
  return `${x.toFixed(2)}%`;
}

function fmtVol(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return "—";
  return x.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function SummaryCard({ symbol }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: res } = await getSummary(symbol);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) {
          setData(null);
          setError(e?.response?.data?.detail || e?.message || "Failed to load summary");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  const items = data
    ? [
        { label: "52W High", value: fmtPrice(data.week52_high), color: "text-green-400" },
        { label: "52W Low", value: fmtPrice(data.week52_low), color: "text-red-400" },
        { label: "Avg Close", value: fmtPrice(data.avg_close), color: "text-slate-200" },
        { label: "Max Daily Return", value: fmtPct(data.max_daily_return), color: "text-slate-200" },
        { label: "Min Daily Return", value: fmtPct(data.min_daily_return), color: "text-slate-200" },
        { label: "Avg Volume", value: fmtVol(data.avg_volume), color: "text-slate-200" },
      ]
    : [];

  return (
    <div className="rounded-xl bg-slate-800 p-4 shadow-lg">
      <h3 className="mb-3 text-lg font-semibold text-white">
        Summary — {data?.name || symbol}
      </h3>
      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-500 border-t-blue-500" />
        </div>
      )}
      {error && !loading && (
        <p className="text-sm text-red-400">{String(error)}</p>
      )}
      {!loading && !error && data && (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-lg bg-slate-900/50 px-4 py-3"
            >
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
              <p className={`mt-1 text-lg font-semibold ${item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
