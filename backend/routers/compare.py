import numpy as np
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import StockData
from schemas import CompareOut, StockDataOut

router = APIRouter(tags=["compare"])


@router.get("/compare", response_model=CompareOut)
async def compare_stocks(
    symbol1: str = Query(...),
    symbol2: str = Query(...),
    days: int = Query(default=30),
    session: AsyncSession = Depends(get_db),
):
    if days not in (30, 60, 90):
        raise HTTPException(status_code=400, detail="days must be 30, 60, or 90")

    r1 = await session.execute(
        select(StockData)
        .where(StockData.symbol == symbol1)
        .order_by(desc(StockData.date))
        .limit(days)
    )
    rows1 = list(r1.scalars().all())
    rows1.reverse()

    r2 = await session.execute(
        select(StockData)
        .where(StockData.symbol == symbol2)
        .order_by(desc(StockData.date))
        .limit(days)
    )
    rows2 = list(r2.scalars().all())
    rows2.reverse()

    if not rows1 or not rows2:
        raise HTTPException(status_code=404, detail="Insufficient data for comparison")

    m1 = {r.date: float(r.close) for r in rows1}
    m2 = {r.date: float(r.close) for r in rows2}
    common_dates = sorted(set(m1.keys()) & set(m2.keys()))

    if len(common_dates) < 2:
        correlation = 0.0
    else:
        a = np.array([m1[d] for d in common_dates], dtype=float)
        b = np.array([m2[d] for d in common_dates], dtype=float)
        if np.std(a) == 0 or np.std(b) == 0:
            correlation = 0.0
        else:
            c = float(np.corrcoef(a, b)[0, 1])
            correlation = 0.0 if np.isnan(c) else c

    return CompareOut(
        symbol1=symbol1,
        symbol2=symbol2,
        symbol1_data=[StockDataOut.model_validate(r) for r in rows1],
        symbol2_data=[StockDataOut.model_validate(r) for r in rows2],
        correlation=correlation,
    )
