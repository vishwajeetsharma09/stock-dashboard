import { useEffect, useState, useRef } from "react"

export default function Ticker() {
  const [prices, setPrices] = useState({})
  const [status, setStatus] = useState("connecting")
  const WS_URL = "wss://stock-dashboard-tfvx.onrender.com"
  const wsRef = useRef(null)

  useEffect(() => {
    connectWS()
    return () => wsRef.current?.close()
  }, [])

  const connectWS = () => {
    // const ws = new WebSocket("ws://localhost:8000/ws/ticker")
    const ws = new WebSocket(`&{WS_URL}/ws/ticker`)

    wsRef.current = ws
    ws.onopen = () => setStatus("live")
    ws.onmessage = (e) => {
      try { setPrices(JSON.parse(e.data)) } catch {}
    }
    ws.onclose = () => setTimeout(connectWS, 3000)
  }

  const items = Object.entries(prices)

  return (
    <div style={{
      width: "100%",
      overflow: "hidden",        /* ✅ key fix */
      backgroundColor: "#0f172a",
      borderBottom: "1px solid #334155",
      padding: "6px 0",
      display: "flex",
      alignItems: "center",
      boxSizing: "border-box",   /* ✅ key fix */
    }}>

      {/* Status dot — fixed, never scrolls */}
      <div style={{
        flexShrink: 0,           /* ✅ never shrinks or grows */
        padding: "0 12px",
        borderRight: "1px solid #334155",
        marginRight: "12px",
        display: "flex",
        alignItems: "center",
        gap: "6px"
      }}>
        <div style={{
          width: 8, height: 8,
          borderRadius: "50%",
          backgroundColor: status === "live" ? "#4ade80" : "#facc15",
        }}/>
        <span style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1 }}>
          {status === "live" ? "LIVE" : status.toUpperCase()}
        </span>
      </div>

      {/* Scrolling area — strictly contained */}
      <div style={{
        flex: 1,                 /* ✅ takes remaining space only */
        overflow: "hidden",      /* ✅ clips content */
        position: "relative",
      }}>
        {items.length === 0 ? (
          <span style={{ color: "#475569", fontSize: 13 }}>
            ⏳ Loading prices...
          </span>
        ) : (
          <div style={{
            display: "inline-flex",
            gap: 40,
            whiteSpace: "nowrap",
            animation: "tickerMove 35s linear infinite",
          }}>
            {/* duplicate for seamless loop */}
            {[...items, ...items].map(([symbol, data], i) => (
              <span key={i} style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "monospace",
                fontSize: 13,
              }}>
                <span style={{ color: "#cbd5e1", fontWeight: 600 }}>
                  {symbol.replace(".NS", "")}
                </span>
                <span style={{ color: "#ffffff" }}>
                  ₹{Number(data.price).toLocaleString("en-IN")}
                </span>
                <span style={{
                  fontSize: 11,
                  padding: "2px 6px",
                  borderRadius: 4,
                  backgroundColor: data.change_pct >= 0
                    ? "rgba(74,222,128,0.1)"
                    : "rgba(248,113,113,0.1)",
                  color: data.change_pct >= 0 ? "#4ade80" : "#f87171",
                }}>
                  {data.change_pct >= 0 ? "▲" : "▼"}
                  {Math.abs(data.change_pct)}%
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}