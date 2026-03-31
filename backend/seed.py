"""
Standalone seed script — uses a synchronous engine (psycopg2).
Run from backend/: python seed.py
"""
import os
import sys

import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from constants import COMPANY_INFO
from models import Base, Company, StockData
from services.data_fetcher import fetch_stock_data
from services.metrics import add_metrics

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")
if not DATABASE_URL:
    print("DATABASE_URL is not set", file=sys.stderr)
    sys.exit(1)

SYNC_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+psycopg2://")


def main() -> None:
    engine = create_engine(SYNC_URL, future=True)
    Base.metadata.create_all(bind=engine)

    symbols = list(COMPANY_INFO.keys())

    with Session(engine) as session:
        for symbol in symbols:
            info = COMPANY_INFO[symbol]
            existing = session.scalar(select(Company).where(Company.symbol == symbol))
            if existing is None:
                session.add(
                    Company(symbol=symbol, name=info["name"], sector=info["sector"])
                )
                session.commit()
                print(f"[{symbol}] Inserted company row.")
            else:
                print(f"[{symbol}] Company already exists.")

        for symbol in symbols:
            print(f"[{symbol}] Fetching yfinance data...")
            df = fetch_stock_data(symbol)
            if df.empty:
                print(f"[{symbol}] No data returned, skipping.")
                continue
            df = add_metrics(df)

            inserted = 0
            skipped = 0
            for _, row in df.iterrows():
                d = row["date"]
                if hasattr(d, "date"):
                    d = d.date()
                dup = session.scalar(
                    select(StockData).where(
                        StockData.symbol == symbol,
                        StockData.date == d,
                    )
                )
                if dup is not None:
                    skipped += 1
                    continue
                session.add(
                    StockData(
                        symbol=symbol,
                        date=d,
                        open=float(row["open"]),
                        high=float(row["high"]),
                        low=float(row["low"]),
                        close=float(row["close"]),
                        volume=int(row["volume"])
                        if not pd.isna(row["volume"])
                        else 0,
                        daily_return=float(row["daily_return"]),
                        moving_avg_7d=float(row["moving_avg_7d"]),
                        week52_high=float(row["week52_high"]),
                        week52_low=float(row["week52_low"]),
                        volatility_score=float(row["volatility_score"]),
                    )
                )
                inserted += 1
            session.commit()
            print(f"[{symbol}] Inserted {inserted} rows, skipped {skipped} duplicates.")

    print("Seeding complete!")


if __name__ == "__main__":
    main()
