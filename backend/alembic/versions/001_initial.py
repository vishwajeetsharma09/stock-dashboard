"""initial schema

Revision ID: 001_initial
Revises:
Create Date: 2026-03-31

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "companies",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("symbol", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("sector", sa.String(length=128), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_companies_symbol"), "companies", ["symbol"], unique=True)

    op.create_table(
        "stock_data",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("symbol", sa.String(length=32), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("open", sa.Float(), nullable=False),
        sa.Column("high", sa.Float(), nullable=False),
        sa.Column("low", sa.Float(), nullable=False),
        sa.Column("close", sa.Float(), nullable=False),
        sa.Column("volume", sa.BigInteger(), nullable=False),
        sa.Column("daily_return", sa.Float(), nullable=False),
        sa.Column("moving_avg_7d", sa.Float(), nullable=False),
        sa.Column("week52_high", sa.Float(), nullable=False),
        sa.Column("week52_low", sa.Float(), nullable=False),
        sa.Column("volatility_score", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["symbol"], ["companies.symbol"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("symbol", "date", name="uq_stock_data_symbol_date"),
    )
    op.create_index(op.f("ix_stock_data_symbol"), "stock_data", ["symbol"], unique=False)
    op.create_index(op.f("ix_stock_data_date"), "stock_data", ["date"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_stock_data_date"), table_name="stock_data")
    op.drop_index(op.f("ix_stock_data_symbol"), table_name="stock_data")
    op.drop_table("stock_data")
    op.drop_index(op.f("ix_companies_symbol"), table_name="companies")
    op.drop_table("companies")
