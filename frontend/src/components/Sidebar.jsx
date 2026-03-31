import { useEffect, useState } from "react";
import { getCompanies } from "../api/stockApi.js";

export default function Sidebar({ activeSymbol, onSelect }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getCompanies();
        if (!cancelled) setCompanies(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load companies");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <aside className="w-[260px] shrink-0 border-r border-slate-700 bg-slate-950 p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Companies
      </h2>
      {loading && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-lg bg-slate-800"
            />
          ))}
        </div>
      )}
      {!loading && error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {!loading && !error && (
        <ul className="space-y-1">
          {companies.map((c) => {
            const active = c.symbol === activeSymbol;
            return (
              <li key={c.symbol}>
                <button
                  type="button"
                  onClick={() => onSelect(c.symbol)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    active
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  }`}
                >
                  <span className="font-mono text-xs text-slate-300">
                    {c.symbol}
                  </span>
                  <span className="mt-0.5 block font-medium text-white">
                    {c.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
