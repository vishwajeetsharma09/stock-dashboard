import feedparser

COMPANY_NAMES = {
    "RELIANCE.NS": "Reliance Industries",
    "TCS.NS": "TCS Tata Consultancy",
    "INFY.NS": "Infosys",
    "HDFCBANK.NS": "HDFC Bank",
    "ICICIBANK.NS": "ICICI Bank",
    "WIPRO.NS": "Wipro",
    "BAJFINANCE.NS": "Bajaj Finance",
    "SBIN.NS": "SBI Bank",
    "HINDUNILVR.NS": "Hindustan Unilever",
    "ITC.NS": "ITC Limited"
}

def get_news(symbol: str):
    company = COMPANY_NAMES.get(symbol, symbol)
    url = f"https://news.google.com/rss/search?q={company}+stock+NSE&hl=en-IN"
    feed = feedparser.parse(url)
    
    news = []
    for entry in feed.entries[:5]:   # latest 5 news
        # simple keyword sentiment
        title = entry.title.lower()
        if any(w in title for w in ["surge","profit","gain","high","buy","up"]):
            sentiment = "positive"
        elif any(w in title for w in ["fall","loss","down","sell","crash","low"]):
            sentiment = "negative"
        else:
            sentiment = "neutral"
            
        news.append({
            "title": entry.title,
            "link": entry.link,
            "published": entry.published,
            "sentiment": sentiment
        })
    return news