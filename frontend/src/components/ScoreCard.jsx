import { useState, useEffect } from 'react'
import { getScore, getFallbackScore, getReportUrl } from '../services/api'

function RiskBadge({ level }) {
  const styles = {
    Low: 'border-emerald-800 bg-emerald-950/40 text-emerald-400 shadow-emerald-500/10',
    Medium: 'border-amber-800 bg-amber-950/40 text-amber-400 shadow-amber-500/10',
    High: 'border-rose-800 bg-rose-950/40 text-rose-400 shadow-rose-500/10',
  }
  const s = styles[level] || styles.Low
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${s}`}>
      {level}
    </span>
  )
}

function ScoreGauge({ score }) {
  const color = score >= 60 ? '#fb7185' : score >= 30 ? '#fbbf24' : '#34d399'
  const glow = score >= 60 ? 'rgba(251,113,133,0.3)' : score >= 30 ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'
  const r = 44
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="140" height="140" className="-rotate-90 drop-shadow-lg">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="70" cy="70" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            filter="url(#glow)"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-4xl font-bold tracking-tight" style={{ color }}>
            {score}
          </p>
          <p className="text-xs text-slate-600">/ 100</p>
        </div>
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
      <div className="rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-lg shadow-black/20">
        <div className="flex animate-pulse flex-col items-center gap-4">
          <div className="h-32 w-32 rounded-full bg-slate-800" />
          <div className="h-4 w-40 rounded bg-slate-800" />
        </div>
      </div>
    )
  }

  if (!scoreData) {
    return (
      <div className="rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-lg shadow-black/20">
        <p className="text-sm text-rose-400">{error || 'Score not available.'}</p>
      </div>
    )
  }

  const gaugeColor = scoreData.overall_score >= 60
    ? 'from-rose-500 to-pink-600'
    : scoreData.overall_score >= 30
    ? 'from-amber-500 to-orange-600'
    : 'from-emerald-500 to-teal-600'

  return (
    <div className="rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-lg shadow-black/20">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br ${gaugeColor} text-xs font-bold text-white shadow-sm`}>
            S
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Risk Score
          </h2>
        </div>
        <RiskBadge level={scoreData.risk_level} />
      </div>

      <div className="mb-6 flex justify-center">
        <ScoreGauge score={scoreData.overall_score} />
      </div>

      {scoreData.category_scores && (
        <div className="mb-6 space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Category Breakdown
          </h3>
          {Object.entries(scoreData.category_scores).map(([cat, sc]) => (
            <div key={cat} className="group flex items-center gap-3">
              <span className="w-28 text-xs text-slate-400 truncate">{cat}</span>
              <div className="flex-1 rounded-full bg-slate-800 h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${gaugeColor} transition-all duration-700 group-hover:opacity-80`}
                  style={{ width: `${sc}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs font-medium text-slate-500">{sc}</span>
            </div>
          ))}
        </div>
      )}

      {scoreData.recommendations && (
        <div className="mb-6">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Recommendations
          </h3>
          <div className="space-y-2">
            {scoreData.recommendations.map((rec, i) => (
              <div key={i} className="flex gap-3 rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-2.5">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gaugeColor} text-[10px] font-bold text-white`}>
                  {i + 1}
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <a
        href={getReportUrl(token)}
        download
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm font-medium text-slate-300 shadow-sm transition-all hover:bg-slate-700/50 hover:text-white hover:border-slate-600"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download PDF Report
      </a>
    </div>
  )
}
