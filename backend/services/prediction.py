import numpy as np
from datetime import date, timedelta

def predict_next_7_days(historical_data: list) -> list:
    if len(historical_data) < 10:
        return []

    closes = np.array([float(d.close) for d in historical_data])
    x      = np.arange(len(closes))

    # linear regression
    coeffs    = np.polyfit(x, closes, deg=1)
    slope     = coeffs[0]
    intercept = coeffs[1]

    # ✅ last 30 days as actuals
    actuals = []
    for d in historical_data[-30:]:
        # handle both date and datetime objects
        if hasattr(d.date, 'date'):
            day = d.date.date()   # datetime → date
        else:
            day = d.date          # already a date

        actuals.append({
            "date":  day.strftime("%Y-%m-%d"),
            "price": round(float(d.close), 2),
            "type":  "actual"
        })

    # ✅ predict next 7 trading days
    predictions = []
    if hasattr(historical_data[-1].date, 'date'):
        last_date = historical_data[-1].date.date()
    else:
        last_date = historical_data[-1].date

    count = 0
    days_ahead = 1

    while count < 7:
        future_date = last_date + timedelta(days=days_ahead)
        days_ahead += 1

        # skip Saturday(5) and Sunday(6)
        if future_date.weekday() >= 5:
            continue

        future_x     = len(closes) + count
        future_price = slope * future_x + intercept

        predictions.append({
            "date":  future_date.strftime("%Y-%m-%d"),
            "price": round(float(future_price), 2),
            "type":  "predicted"
        })
        count += 1

    return actuals + predictions