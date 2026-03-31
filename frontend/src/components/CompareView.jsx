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
import { compareStocks } from "../api/stockApi.js";

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
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function correlationLabel(r) {
  const x = Number(r);
  if (x >= 0.7) return "Strong Positive Correlation 🟢";
  if (x >= 0.3) return "Moderate Positive Correlation 🟡";
  return "Weak / No Correlation 🔴";
}

export default function CompareView({ companies }) {
  const [stock1, setStock1] = useState("INFY.NS");
  const [stock2, setStock2] = useState("TCS.NS");
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!companies?.length) return;
    setStock1((prev) =>
      companies.some((c) => c.symbol === prev)
        ? prev
        : companies[0].symbol
    );
    setStock2((prev) => {
      if (companies.some((c) => c.symbol === prev)) return prev;
      return companies[Math.min(1, companies.length - 1)].symbol;
    });
  }, [companies]);

  const runCompare = async () => {
    if (stock1 === stock2) {
      setError("Choose two different symbols.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await compareStocks(stock1, stock2, days);
      setResult(data);
    } catch (e) {
      setResult(null);
      setError(
        e?.response?.data?.detail || e?.message || "Comparison failed"
      );
    } finally {
      setLoading(false);
    }
  };

  let chartData = null;
  if (result?.symbol1_data?.length && result?.symbol2_data?.length) {
    const m2 = new Map(
      result.symbol2_data.map((r) => [r.date, Number(r.close)])
    );
    const labels = [];
    const s1 = [];
    const s2 = [];
    for (const row of result.symbol1_data) {
      const c2 = m2.get(row.date);
      if (c2 !== undefined) {
        labels.push(formatDateLabel(row.date));
        s1.push(Number(row.close));
        s2.push(c2);
      }
    }
    if (labels.length === 0) {
      const l1 = result.symbol1_data.map((r) => formatDateLabel(r.date));
      chartData = {
        labels: l1,
        datasets: [
          {
            label: result.symbol1,
            data: result.symbol1_data.map((r) => Number(r.close)),
            borderColor: "#3b82f6",
            borderWidth: 2,
            tension: 0.2,
            pointRadius: 0,
          },
          {
            label: result.symbol2,
            data: result.symbol2_data.map((r) => Number(r.close)),
            borderColor: "#a855f7",
            borderWidth: 2,
            tension: 0.2,
            pointRadius: 0,
          },
        ],
      };
    } else {
      chartData = {
        labels,
        datasets: [
          {
            label: result.symbol1,
            data: s1,
            borderColor: "#3b82f6",
            borderWidth: 2,
            tension: 0.2,
            pointRadius: 0,
          },
          {
            label: result.symbol2,
            data: s2,
            borderColor: "#a855f7",
            borderWidth: 2,
            tension: 0.2,
            pointRadius: 0,
          },
        ],
      };
    }
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#e2e8f0" } },
      title: {
        display: true,
        text: "Close price comparison",
        color: "#f8fafc",
      },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8" },
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
      <h3 className="mb-4 text-lg font-semibold">Compare stocks</h3>
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">Stock 1</span>
          <select
            className="min-w-[200px] rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white"
            value={stock1}
            onChange={(e) => setStock1(e.target.value)}
          >
            {(companies || []).map((c) => (
              <option key={c.symbol} value={c.symbol}>
                {c.symbol} — {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">Stock 2</span>
          <select
            className="min-w-[200px] rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white"
            value={stock2}
            onChange={(e) => setStock2(e.target.value)}
          >
            {(companies || []).map((c) => (
              <option key={c.symbol} value={c.symbol}>
                {c.symbol} — {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">Days</span>
          <select
            className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={30}>30</option>
            <option value={60}>60</option>
            <option value={90}>90</option>
          </select>
        </label>
        <button
          type="button"
          onClick={runCompare}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? "Comparing…" : "Compare"}
        </button>
      </div>
      {error && (
        <p className="mb-4 text-sm text-red-400">{String(error)}</p>
      )}
      {result && (
        <>
          <div className="relative mb-4 h-[320px]">
            {chartData && <Line data={chartData} options={options} />}
          </div>
          <p className="text-center text-slate-300">
            Pearson correlation:{" "}
            <span className="font-mono font-semibold text-white">
              {Number(result.correlation).toFixed(4)}
            </span>
          </p>
          <p className="mt-2 text-center text-lg">
            {correlationLabel(result.correlation)}
          </p>
        </>
      )}
    </div>
  );
}
