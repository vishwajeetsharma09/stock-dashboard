import pandas as pd


def add_metrics(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df

    out = df.sort_values("date").copy()
    out["daily_return"] = (out["close"] - out["open"]) / out["open"] * 100.0
    out["moving_avg_7d"] = out["close"].rolling(7).mean()
    out["week52_high"] = out["close"].rolling(252, min_periods=1).max()
    out["week52_low"] = out["close"].rolling(252, min_periods=1).min()
    out["volatility_score"] = out["daily_return"].rolling(30, min_periods=1).std()

    for col in ("daily_return", "moving_avg_7d", "week52_high", "week52_low", "volatility_score"):
        out[col] = out[col].fillna(0)

    return out


# ADD at the bottom of your existing metrics.py
def calculate_fear_greed(data: list) -> float:
    if not data:
        return 50
    
    returns = [d.daily_return for d in data]
    volatilities = [d.volatility_score for d in data]
    
    avg_return = sum(returns) / len(returns)
    avg_volatility = sum(volatilities) / len(volatilities)
    
    # momentum: positive return = greed, negative = fear
    score = 50
    score += avg_return * 10
    score -= avg_volatility * 2
    
    return round(max(0, min(100, score)), 1)