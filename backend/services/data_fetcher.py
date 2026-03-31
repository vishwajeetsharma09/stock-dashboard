import pandas as pd
import yfinance as yf


def fetch_stock_data(symbol: str) -> pd.DataFrame:
    ticker = yf.Ticker(symbol)
    df = ticker.history(period="1y", auto_adjust=True)

    if df.empty:
        return pd.DataFrame(
            columns=["date", "open", "high", "low", "close", "volume"]
        )

    df = df.rename(
        columns={
            "Open": "open",
            "High": "high",
            "Low": "low",
            "Close": "close",
            "Volume": "volume",
        }
    )

    df = df.reset_index()
    if "Datetime" in df.columns:
        df = df.rename(columns={"Datetime": "date"})
    elif "Date" in df.columns:
        df = df.rename(columns={"Date": "date"})
    else:
        first = df.columns[0]
        df = df.rename(columns={first: "date"})

    df["date"] = pd.to_datetime(df["date"]).dt.normalize()
    keep = ["date", "open", "high", "low", "close", "volume"]
    for c in keep:
        if c not in df.columns:
            df[c] = float("nan") if c != "volume" else 0
    df = df[keep]
    df = df.sort_values("date")
    df = df.ffill()
    df = df.dropna(subset=["open", "high", "low", "close"])
    df = df.reset_index(drop=True)

    return df
