import { useEffect, useState } from "react"
import { getPrediction } from "../api/stockApi"
import {
  Chart as ChartJS,
  LineElement, PointElement,
  LinearScale, CategoryScale,
  Tooltip, Legend, Filler
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(
  LineElement, PointElement,
  LinearScale, CategoryScale,
  Tooltip, Legend, Filler
)

export default function PredictionChart({ symbol }) {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading]     = useState(false)
  const [shown, setShown]         = useState(false)

  const loadPrediction = async () => {
    setLoading(true)
    setShown(true)
    try {
      const { data } = await getPrediction(symbol)

      const actuals    = data.data.filter(d => d.type === "actual")
      const predicted  = data.data.filter(d => d.type === "predicted")

      // all labels = actual dates + predicted dates
      const allLabels = data.data.map(d => d.date)

      // actual line — null for predicted positions
      const actualLine = data.data.map(d =>
        d.type === "actual" ? d.price : null
      )

      // prediction line — null for actual positions
      // but start from last actual price for continuity
      const lastActualPrice = actuals[actuals.length - 1]?.price
      const predLine = data.data.map((d, i) => {
        if (d.type === "predicted") return d.price
        // connect prediction line to last actual point
        if (i === actuals.length - 1) return d.price
        return null
      })

      setChartData({
        labels: allLabels,
        datasets: [
          {
            label: "Actual Price",
            data: actualLine,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59,130,246,0.1)",
            borderWidth: 2,
            pointRadius: 2,
            fill: true,
            tension: 0.3,
            spanGaps: false,
          },
          {
            label: "Predicted Price",
            data: predLine,
            borderColor: "#f97316",
            backgroundColor: "rgba(249,115,22,0.1)",
            borderWidth: 2,
            borderDash: [6, 4],     // ✅ dashed line = prediction
            pointRadius: 4,
            pointBackgroundColor: "#f97316",
            fill: false,
            tension: 0.3,
            spanGaps: true,
          }
        ]
      })
    } catch (err) {
      console.error("Prediction error:", err)
    }
    setLoading(false)
  }

  // reload when symbol changes
  useEffect(() => {
    if (shown) loadPrediction()
  }, [symbol])

  return (
    <div className="bg-slate-800  
                   rounded-xl p-4 mt-6 shadow-lg">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white 
                         text-slate-900">
            🤖 AI Price Prediction
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Linear regression — next 7 trading days
          </p>
        </div>

        {/* Show/Hide button */}
        <button
          onClick={shown ? () => setShown(false) : loadPrediction}
          className="px-4 py-2 rounded-lg text-sm font-medium
                     bg-orange-500 hover:bg-orange-600 
                     text-white transition-all"
        >
          {loading   ? "⏳ Predicting..." :
           shown     ? "Hide Prediction" :
           "🤖 Predict Next 7 Days"}
        </button>
      </div>

      {/* Chart */}
      {shown && chartData && (
        <>
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  labels: { color: "#94a3b8" }
                },
                tooltip: {
                  callbacks: {
                    label: (ctx) => `₹${ctx.parsed.y?.toLocaleString("en-IN")}`
                  }
                }
              },
              scales: {
                x: {
                  ticks: {
                    color: "#64748b",
                    maxTicksLimit: 10,
                    maxRotation: 45,
                  },
                  grid: { color: "rgba(100,116,139,0.2)" }
                },
                y: {
                  ticks: {
                    color: "#64748b",
                    callback: (v) => `₹${v.toLocaleString("en-IN")}`
                  },
                  grid: { color: "rgba(100,116,139,0.2)" }
                }
              }
            }}
          />

          {/* Disclaimer */}
          <p className="text-xs text-slate-500 mt-3 text-center">
            ⚠️ For educational purposes only. 
            Not financial advice.
          </p>
        </>
      )}
    </div>
  )
}