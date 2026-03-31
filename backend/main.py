from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from services.websocket_manager import (
    manager, get_cached_prices, start_price_updater
)
import asyncio
from routers import companies, stocks, summary, compare, gainers, insights, prediction

app = FastAPI(title="Stock Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(companies.router)
app.include_router(stocks.router)
app.include_router(summary.router)
app.include_router(compare.router)
app.include_router(gainers.router)
app.include_router(insights.router)
app.include_router(prediction.router)

# ✅ Fetch prices immediately when server starts
@app.on_event("startup")
async def startup_event():
    print("🚀 API starting...")
    # Run price updater as background task — doesn't block startup
    asyncio.create_task(start_price_updater())

# ✅ WebSocket — sends cached data INSTANTLY, no waiting
@app.websocket("/ws/ticker")
async def websocket_ticker(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # get from cache — returns immediately
            prices = await get_cached_prices()
            await websocket.send_text(
                __import__('json').dumps(prices)
            )
            await asyncio.sleep(30)  # resend every 30 seconds
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WS error: {e}")
        manager.disconnect(websocket)