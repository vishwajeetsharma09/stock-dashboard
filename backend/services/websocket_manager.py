from fastapi import WebSocket
from typing import List
import yfinance as yf
import asyncio
import math
import json

SYMBOLS = [
    "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS",
    "ICICIBANK.NS", "WIPRO.NS", "BAJFINANCE.NS",
    "SBIN.NS", "HINDUNILVR.NS", "ITC.NS"
]

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

manager = ConnectionManager()

# ✅ Global cache — fetched ONCE at startup, reused for all connections
_price_cache = {}

def safe_float(val):
    """Convert any value to safe float, return 0.0 if NaN/None"""
    try:
        f = float(val)
        return 0.0 if math.isnan(f) or math.isinf(f) else round(f, 2)
    except:
        return 0.0

async def fetch_live_prices():
    global _price_cache
    prices = {}
    
    for symbol in SYMBOLS:
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="5d")
            hist = hist.dropna(subset=["Close"])

            if len(hist) >= 2:
                prev  = safe_float(hist["Close"].iloc[-2])
                curr  = safe_float(hist["Close"].iloc[-1])
                chg   = round(((curr - prev) / prev) * 100, 2) if prev else 0.0
                prices[symbol] = {"price": curr, "change_pct": chg}
            elif len(hist) == 1:
                curr  = safe_float(hist["Close"].iloc[-1])
                prices[symbol] = {"price": curr, "change_pct": 0.0}
            else:
                prices[symbol] = {"price": 0.0, "change_pct": 0.0}

        except Exception as e:
            print(f"❌ {symbol}: {e}")
            prices[symbol] = {"price": 0.0, "change_pct": 0.0}

    _price_cache = prices  # update global cache
    return prices

async def get_cached_prices():
    """Return cache instantly, fetch in background if empty"""
    global _price_cache
    if not _price_cache:
        await fetch_live_prices()  # only blocks on very first call
    return _price_cache

async def start_price_updater():
    """Background task — runs forever, updates cache every 5 minutes"""
    print("🔄 Price updater started...")
    await fetch_live_prices()  # fetch immediately on startup
    print("✅ Initial prices loaded!")
    while True:
        await asyncio.sleep(300)  # wait 5 minutes
        print("🔄 Refreshing prices...")
        await fetch_live_prices()
        print("✅ Prices updated!")