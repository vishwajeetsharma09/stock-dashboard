from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Company, StockData
from schemas import SummaryOut

router = APIRouter(tags=["summary"])


@router.get("/summary/{symbol}", response_model=SummaryOut)
async def get_summary(symbol: str, session: AsyncSession = Depends(get_db)):
    company = await session.scalar(select(Company).where(Company.symbol == symbol))
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")

    agg = await session.execute(
        select(
            func.max(StockData.week52_high).label("week52_high"),
            func.min(StockData.week52_low).label("week52_low"),
            func.avg(StockData.close).label("avg_close"),
            func.max(StockData.daily_return).label("max_daily_return"),
            func.min(StockData.daily_return).label("min_daily_return"),
            func.avg(StockData.volume).label("avg_volume"),
        ).where(StockData.symbol == symbol)
    )
    row = agg.one()

    if row.avg_close is None:
        raise HTTPException(status_code=404, detail="No stock data for symbol")

    return SummaryOut(
        symbol=symbol,
        name=company.name,
        week52_high=float(row.week52_high or 0),
        week52_low=float(row.week52_low or 0),
        avg_close=float(row.avg_close or 0),
        max_daily_return=float(row.max_daily_return or 0),
        min_daily_return=float(row.min_daily_return or 0),
        avg_volume=float(row.avg_volume or 0),
    )
