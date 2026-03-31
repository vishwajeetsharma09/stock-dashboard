import { useEffect, useState } from "react";
import { getCompanies } from "./api/stockApi.js";
import CompareView from "./components/CompareView.jsx";
import Sidebar from "./components/Sidebar.jsx";
import StockChart from "./components/StockChart.jsx";
import SummaryCard from "./components/SummaryCard.jsx";
import TopGainers from "./components/TopGainers.jsx";
import Ticker from "./components/Ticker";
import FearGreed from "./components/FearGreed";
import NewsFeed from "./components/NewsFeed";
import PredictionChart from "./components/PredictionChart"


export default function App() {
  const [activeSymbol, setActiveSymbol] = useState("RELIANCE.NS");
  const [companies, setCompanies] = useState([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await getCompanies();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setCompanies(data);
          setActiveSymbol((prev) => {
            const exists = data.some((c) => c.symbol === prev);
            return exists ? prev : data[0].symbol;
          });
        }
      } catch {
        /* keep defaults */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white">

      {/* ✅ Ticker at very top, full width */}
      <Ticker />

      {/* ✅ Navbar below ticker */}
      <header className="border-b border-slate-700 bg-slate-950 
                         px-6 py-4 shadow-lg">
        <h1 className="text-xl font-semibold tracking-tight">
          📈 Stock Intelligence
        </h1>
      </header>

      {/* ✅ Main layout — sidebar + content */}
      <div className="flex">

        {/* Sidebar — fixed height, scrollable */}
        <Sidebar
          activeSymbol={activeSymbol}
          onSelect={setActiveSymbol}
        />

        {/* Main content area */}
        <div className="flex-1 min-w-0 overflow-auto p-6">

          {/* Top row — Gainers + Fear&Greed side by side */}
          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <div className="lg:col-span-2">
              <TopGainers />
            </div>
            <div>
              <FearGreed symbol={activeSymbol} />
            </div>
          </div>

          {/* Chart + Summary */}
          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <StockChart symbol={activeSymbol} />
            <SummaryCard symbol={activeSymbol} />
          </div>

          <PredictionChart symbol={activeSymbol} />

          {/* News Feed */}
          {/* <NewsFeed symbol={activeSymbol} /> */}

          {/* Compare */}
          <div className="mt-6">
            <CompareView companies={companies} />
          </div>

        </div>
      </div>

    </div>
  );
}