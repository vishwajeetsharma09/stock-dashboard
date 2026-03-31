from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import StockData
from schemas import StockDataOut

router = APIRouter(tags=["stocks"])


@router.get("/data/{symbol}", response_model=list[StockDataOut])
async def get_stock_data(
    symbol: str,
    days: int = Query(default=30, description="Last N rows: 30, 60, or 90"),
    session: AsyncSession = Depends(get_db),
):
    if days not in (30, 60, 90):
        raise HTTPException(status_code=400, detail="days must be 30, 60, or 90")

    result = await session.execute(
        select(StockData)
        .where(StockData.symbol == symbol)
        .order_by(desc(StockData.date))
        .limit(days)
    )
    rows = list(result.scalars().all())
    rows.reverse()
    return [StockDataOut.model_validate(r) for r in rows]
