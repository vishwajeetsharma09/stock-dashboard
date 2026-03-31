from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Company, StockData
from schemas import GainerLoserItem, GainersLosersOut

router = APIRouter(tags=["gainers"])


@router.get("/gainers-losers", response_model=GainersLosersOut)
async def gainers_losers(session: AsyncSession = Depends(get_db)):
    latest = await session.scalar(select(StockData.date).order_by(desc(StockData.date)).limit(1))
    if latest is None:
        raise HTTPException(status_code=404, detail="No stock data in database")

    result = await session.execute(select(StockData).where(StockData.date == latest))
    rows = list(result.scalars().all())

    if not rows:
        raise HTTPException(status_code=404, detail="No rows for latest date")

    enriched: list[tuple[StockData, str]] = []
    for r in rows:
        comp = await session.scalar(select(Company).where(Company.symbol == r.symbol))
        name = comp.name if comp else r.symbol
        enriched.append((r, name))

    enriched.sort(key=lambda x: x[0].daily_return, reverse=True)
    top_gainers = enriched[:3]
    top_losers = enriched[-3:]
    top_losers_sorted = sorted(top_losers, key=lambda x: x[0].daily_return)

    return GainersLosersOut(
        top_gainers=[
            GainerLoserItem(
                symbol=r.symbol,
                name=name,
                daily_return=float(r.daily_return),
            )
            for r, name in top_gainers
        ],
        top_losers=[
            GainerLoserItem(
                symbol=r.symbol,
                name=name,
                daily_return=float(r.daily_return),
            )
            for r, name in top_losers_sorted
        ],
    )
