import axios from "axios";

/** Dev: `/api` + Vite proxy → FastAPI. Production Docker build: set `VITE_API_BASE` to the API origin (no `/api` suffix). */
// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE || "/api",
// });

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
})

export function getCompanies() {
  return api.get("/companies");
}

export function getStockData(symbol, days) {
  return api.get(`/data/${encodeURIComponent(symbol)}`, { params: { days } });
}

export function getSummary(symbol) {
  return api.get(`/summary/${encodeURIComponent(symbol)}`);
}

export function compareStocks(s1, s2, days) {
  return api.get("/compare", {
    params: { symbol1: s1, symbol2: s2, days },
  });
}

export function getGainersLosers() {
  return api.get("/gainers-losers");
}


// ADD these functions to your existing stockApi.js

export const getFearGreed = (symbol) =>
  api.get(`/fear-greed/${symbol}`)

export const getNews = (symbol) =>
  api.get(`/news/${symbol}`)

export const getInsightData = (symbol) =>
  api.get(`/insights/${symbol}`)

export const getPrediction = (symbol) =>
  api.get(`/predict/${symbol}`)