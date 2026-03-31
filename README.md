# Stock Data Intelligence Dashboard

A full-stack dashboard for exploring NSE stock history, technical-style metrics, peer comparison, and daily gainers versus losers. The backend exposes a FastAPI REST API backed by PostgreSQL; the frontend is a React + Vite single-page app with Chart.js visualizations.

## Tech Stack

| Layer      | Technologies |
| ---------- | ------------ |
| Backend    | Python 3.11+, FastAPI, Uvicorn, SQLAlchemy (async), asyncpg, Alembic, yfinance, Pandas, NumPy |
| Frontend   | React 18, Vite, Chart.js 4 (react-chartjs-2), Axios, Tailwind CSS |
| Database   | PostgreSQL 15 |
| Data source| Yahoo Finance via `yfinance` (symbols use `.NS` suffix) |

## Folder Structure

```
stock-dashboard/
├── backend/
│   ├── alembic/
│   │   ├── versions/
│   │   │   └── 001_initial.py
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── alembic.ini
│   ├── constants.py
│   ├── database.py
│   ├── Dockerfile
│   ├── main.py
│   ├── models.py
│   ├── requirements.txt
│   ├── schemas.py
│   ├── seed.py
│   ├── services/
│   │   ├── data_fetcher.py
│   │   └── metrics.py
│   └── routers/
│       ├── companies.py
│       ├── stocks.py
│       ├── summary.py
│       ├── compare.py
│       └── gainers.py
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── src/
│   │   ├── api/
│   │   │   └── stockApi.js
│   │   ├── components/
│   │   │   ├── CompareView.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StockChart.jsx
│   │   │   ├── SummaryCard.jsx
│   │   │   └── TopGainers.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Python 3.11 or newer  
- Node.js 18 or newer  
- PostgreSQL running locally (or use Docker Compose for the database)

## Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # edit DATABASE_URL to match your PostgreSQL instance
python seed.py
uvicorn main:app --reload --port 8000
```

Apply migrations (optional if you used `seed.py`, which calls `create_all`):

```bash
cd backend
alembic upgrade head
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The dev server uses the Vite proxy so API calls to `/api` are forwarded to `http://localhost:8000` (paths are rewritten so the backend receives `/companies`, `/data/...`, etc.).

For a production build consumed outside dev (for example the included frontend Docker image), the build sets `VITE_API_BASE=http://localhost:8000` so the browser calls the API directly.

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/companies` | List all tracked companies |
| GET | `/data/{symbol}?days=30` | Last 30, 60, or 90 rows of OHLCV and metrics for `symbol` |
| GET | `/summary/{symbol}` | Aggregates: 52W high/low, average close, min/max daily return, average volume |
| GET | `/compare?symbol1=&symbol2=&days=` | Side-by-side series and Pearson correlation of close prices (aligned by date where both exist) |
| GET | `/gainers-losers` | Top 3 and bottom 3 by `daily_return` on the latest date in the database |

Interactive docs: `http://localhost:8000/docs` (Swagger UI).

## Custom Metrics

**`volatility_score`** is the rolling standard deviation (30 trading days, `min_periods=1`) of **daily return**, where daily return is \((\text{close} - \text{open}) / \text{open} \times 100\). It summarizes how much day-to-day return fluctuates: higher values mean the stock’s intraday-to-close outcome has been more dispersed recently, which is useful when comparing riskiness or stability across names (it is not annualized implied volatility).

## Screenshots
<img width="1919" height="949" alt="image" src="https://github.com/user-attachments/assets/3555f490-60a8-45d8-8798-49f1e0199749" />


## Future Improvements

- **ML prediction**: supervised models on lagged features for short-horizon direction or range forecasts.  
- **WebSocket live feed**: push last price and volume during market hours instead of batch Yahoo pulls.  
- **Docker**: compose already includes DB, API, and static frontend; add CI, health endpoints, and optional nginx for a single host/port.
