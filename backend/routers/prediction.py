from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import StockData
from services.prediction import predict_next_7_days

router = APIRouter()

@router.get("/predict/{symbol}")
async def get_prediction(symbol: str, db: AsyncSession = Depends(get_db)):
    # ✅ async select instead of .query()
    result = await db.execute(
        select(StockData)
        .where(StockData.symbol == symbol)
        .order_by(StockData.date.asc())
    )
    data = result.scalars().all()

    if not data:
        return {"error": "No data found for symbol"}

    prediction_data = predict_next_7_days(data)

    return {
        "symbol":      symbol,
        "model":       "Linear Regression",
        "data":        prediction_data,
        "disclaimer":  "For educational purposes only. Not financial advice."
    }