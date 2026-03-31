from datetime import date

from pydantic import BaseModel, ConfigDict


class CompanyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    symbol: str
    name: str
    sector: str


class StockDataOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    symbol: str
    date: date
    open: float
    high: float
    low: float
    close: float
    volume: int
    daily_return: float
    moving_avg_7d: float
    week52_high: float
    week52_low: float
    volatility_score: float


class SummaryOut(BaseModel):
    symbol: str
    name: str
    week52_high: float
    week52_low: float
    avg_close: float
    max_daily_return: float
    min_daily_return: float
    avg_volume: float


class CompareOut(BaseModel):
    symbol1: str
    symbol2: str
    symbol1_data: list[StockDataOut]
    symbol2_data: list[StockDataOut]
    correlation: float


class GainerLoserItem(BaseModel):
    symbol: str
    name: str
    daily_return: float


class GainersLosersOut(BaseModel):
    top_gainers: list[GainerLoserItem]
    top_losers: list[GainerLoserItem]
