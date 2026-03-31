from sqlalchemy import BigInteger, Date, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    symbol: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    sector: Mapped[str] = mapped_column(String(128))


class StockData(Base):
    __tablename__ = "stock_data"
    __table_args__ = (UniqueConstraint("symbol", "date", name="uq_stock_data_symbol_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    symbol: Mapped[str] = mapped_column(
        String(32),
        ForeignKey("companies.symbol", ondelete="CASCADE"),
        index=True,
    )
    date: Mapped[Date] = mapped_column(Date, index=True)
    open: Mapped[float] = mapped_column(Float)
    high: Mapped[float] = mapped_column(Float)
    low: Mapped[float] = mapped_column(Float)
    close: Mapped[float] = mapped_column(Float)
    volume: Mapped[int] = mapped_column(BigInteger)
    daily_return: Mapped[float] = mapped_column(Float)
    moving_avg_7d: Mapped[float] = mapped_column(Float)
    week52_high: Mapped[float] = mapped_column(Float)
    week52_low: Mapped[float] = mapped_column(Float)
    volatility_score: Mapped[float] = mapped_column(Float)
