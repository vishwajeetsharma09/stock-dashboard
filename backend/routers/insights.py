from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import StockData, Company

router = APIRouter()

@router.get("/insights/{symbol}")
async def get_ai_insight(symbol: str, db: Session = Depends(get_db)):
    # Get last 30 days data
    data = db.query(StockData)\
             .filter(StockData.symbol == symbol)\
             .order_by(StockData.date.desc())\
             .limit(30).all()
    
    company = db.query(Company)\
                .filter(Company.symbol == symbol).first()
    
    avg_return = sum(d.daily_return for d in data) / len(data)
    avg_volatility = sum(d.volatility_score for d in data) / len(data)
    latest = data[0]
    
    return {
        "symbol": symbol,
        "name": company.name,
        "summary": {
            "week52_high": latest.week52_high,
            "week52_low": latest.week52_low,
            "avg_daily_return": round(avg_return, 2),
            "avg_volatility": round(avg_volatility, 2),
            "latest_close": latest.close
        }
    }

@router.get("/news/{symbol}")
async def get_news(symbol: str):
    from services.news_fetcher import get_news
    return {"news": get_news(symbol)}

@router.get("/fear-greed/{symbol}")
async def get_fear_greed(symbol: str, db: Session = Depends(get_db)):
    from services.metrics import calculate_fear_greed
    data = db.query(StockData)\
             .filter(StockData.symbol == symbol)\
             .order_by(StockData.date.desc())\
             .limit(30).all()
    score = calculate_fear_greed(data)
    
    if score >= 80:   label = "Extreme Greed 🤑"
    elif score >= 60: label = "Greed 😊"
    elif score >= 40: label = "Neutral 😐"
    elif score >= 20: label = "Fear 😨"
    else:             label = "Extreme Fear 😱"
    
    return {"score": score, "label": label}