import { useEffect, useState } from "react"
import { getNews } from "../api/stockApi"

export default function NewsFeed({ symbol }) {
  const [news, setNews] = useState([])

  useEffect(() => {
    if (symbol) getNews(symbol).then(r => setNews(r.data.news))
  }, [symbol])

  const sentimentColor = {
    positive: "text-green-400 bg-green-400/10",
    negative: "text-red-400 bg-red-400/10",
    neutral:  "text-yellow-400 bg-yellow-400/10"
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <h3 className="text-slate-400 text-sm mb-3">📰 Latest News</h3>
      <div className="space-y-2">
        {news.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0
                            ${sentimentColor[item.sentiment]}`}>
              {item.sentiment}
            </span>
            <a href={item.link} target="_blank"
               className="text-sm text-slate-300 hover:text-white 
                          line-clamp-2 cursor-pointer">
              {item.title}
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
