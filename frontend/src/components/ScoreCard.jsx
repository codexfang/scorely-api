import { useState, useEffect } from 'react'
import { getScore, getFallbackScore, getReportUrl } from '../services/api'

function RiskBadge({ level }) {
  const colors = {
    Low: 'bg-emerald-900/30 text-emerald-400 border-emerald-800',
    Medium: 'bg-amber-900/30 text-amber-400 border-amber-800',
    High: 'bg-red-900/30 text-red-400 border-red-800',
  }
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${colors[level] || colors.Low}`}>
      {level}
    </span>
  )
}

function ScoreGauge({ score }) {
  const color = score >= 60 ? '#ef4444' : score >= 30 ? '#f59e0b' : '#10b981'
  const r = 40
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1f2937" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="relative" style={{ marginTop: '-80px' }}>
        <p className="text-3xl font-bold tracking-tight" style={{ color }}>
          {score}
        </p>
        <p className="text-center text-xs text-gray-600">/ 100</p>
      </div>
    </div>
  )
}

export default function ScoreCard({ token }) {
  const [scoreData, setScoreData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await getScore(token)
        setScoreData(data.score)
      } catch {
        setScoreData(getFallbackScore())
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-5">
        <p className="text-sm text-gray-500">Calculating score...</p>
      </div>
    )
  }

  if (!scoreData) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-5">
        <p className="text-sm text-red-400">{error || 'Score not available.'}</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Risk Score
        </h2>
        <RiskBadge level={scoreData.risk_level} />
      </div>

      <div className="mb-6 flex justify-center">
        <ScoreGauge score={scoreData.overall_score} />
      </div>

      {scoreData.category_scores && (
        <div className="mb-5 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Category Breakdown
          </h3>
          {Object.entries(scoreData.category_scores).map(([cat, sc]) => (
            <div key={cat} className="flex items-center gap-3">
              <span className="w-32 text-xs text-gray-400 truncate">{cat}</span>
              <div className="flex-1 rounded-full bg-gray-800 h-2">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${sc}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs text-gray-500">{sc}</span>
            </div>
          ))}
        </div>
      )}

      {scoreData.recommendations && (
        <div className="mb-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Recommendations
          </h3>
          <ul className="space-y-1">
            {scoreData.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-400">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-600" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      <a
        href={getReportUrl(token)}
        download
        className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download PDF Report
      </a>
    </div>
  )
}
