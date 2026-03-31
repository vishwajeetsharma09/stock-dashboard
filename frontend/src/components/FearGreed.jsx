import { useEffect, useState } from "react"
import { getFearGreed } from "../api/stockApi"

export default function FearGreed({ symbol }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (symbol) getFearGreed(symbol).then(r => setData(r.data))
  }, [symbol])

  if (!data) return null

  const color = data.score >= 60 ? "text-green-400" 
              : data.score >= 40 ? "text-yellow-400" 
              : "text-red-400"

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <h3 className="text-slate-400 text-sm mb-2">Fear & Greed Index</h3>
      
      {/* Gauge Bar */}
      <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
        <div
          className="h-3 rounded-full transition-all duration-500"
          style={{
            width: `${data.score}%`,
            background: `hsl(${data.score}, 80%, 50%)`
          }}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <span className={`text-2xl font-bold ${color}`}>{data.score}</span>
        <span className="text-white text-sm">{data.label}</span>
      </div>
    </div>
  )
}

