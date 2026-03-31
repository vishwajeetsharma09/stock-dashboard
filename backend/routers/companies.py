from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Company
from schemas import CompanyOut

router = APIRouter(tags=["companies"])


@router.get("/companies", response_model=list[CompanyOut])
async def list_companies(session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(Company).order_by(Company.symbol))
    rows = result.scalars().all()
    return [CompanyOut.model_validate(r) for r in rows]
