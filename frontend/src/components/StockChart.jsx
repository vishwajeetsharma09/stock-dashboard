import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getStockData } from "../api/stockApi.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function formatDateLabel(d) {
  if (!d) return "";
  const date = new Date(d);
  return Number.isNaN(date.getTime())
    ? String(d)
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
}

export default function StockChart({ symbol }) {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getStockData(symbol, days);
        if (cancelled) return;
        const labels = (data || []).map((r) => formatDateLabel(r.date));
        const closes = (data || []).map((r) => Number(r.close));
        const ma = (data || []).map((r) => Number(r.moving_avg_7d));
        setChartData({
          labels,
          datasets: [
            {
              label: "Close Price",
              data: closes,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderWidth: 2,
              tension: 0.2,
              pointRadius: 0,
              fill: false,
            },
            {
              label: "7-Day MA",
              data: ma,
              borderColor: "#f97316",
              borderDash: [5, 5],
              borderWidth: 2,
              tension: 0.2,
              pointRadius: 0,
              fill: false,
            },
          ],
        });
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.data?.detail || e?.message || "Failed to load data");
          setChartData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [symbol, days]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#e2e8f0" },
      },
      title: {
        display: true,
        text: `${symbol} — Price & 7D MA`,
        color: "#f8fafc",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8", maxRotation: 45, minRotation: 0 },
        grid: { color: "rgba(148, 163, 184, 0.15)" },
      },
      y: {
        ticks: {
          color: "#94a3b8",
          callback: (v) => `₹${Number(v).toFixed(0)}`,
        },
        grid: { color: "rgba(148, 163, 184, 0.15)" },
      },
    },
  };

  return (
    <div className="rounded-xl bg-slate-800 p-4 shadow-lg">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-400">Range:</span>
        {[30, 60, 90].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDays(d)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              days === d
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-200 hover:bg-slate-600"
            }`}
          >
            {d}D
          </button>
        ))}
      </div>
      <div className="relative h-[320px]">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-slate-900/60">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-500 border-t-blue-500" />
          </div>
        )}
        {error && (
          <p className="text-center text-sm text-red-400">{String(error)}</p>
        )}
        {!loading && !error && chartData && (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
