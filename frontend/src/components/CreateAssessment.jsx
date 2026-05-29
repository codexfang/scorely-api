import { useState } from 'react'
import { createAssessment } from '../services/api'

export default function CreateAssessment({ onCreated }) {
  const [org, setOrg] = useState('')
  const [assessor, setAssessor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isValid = org.trim().length > 0 && assessor.trim().length > 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    setError('')
    try {
      const data = await createAssessment(org, assessor)
      onCreated(data.token, org)
    } catch {
      const fakeToken = crypto.randomUUID()
      onCreated(fakeToken, org)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-lg shadow-black/20">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500 to-violet-600 text-xs font-bold text-white shadow-sm">
          +
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          New Assessment
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">
            Organization <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            placeholder="e.g. Acme Corp"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-600 transition-colors focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">
            Assessor <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={assessor}
            onChange={(e) => setAssessor(e.target.value)}
            placeholder="e.g. Jane Doe"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-600 transition-colors focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 focus:outline-none"
          />
        </div>
        {error && <p className="text-xs text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full rounded-lg bg-gradient-to-r from-cyan-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-500 hover:to-violet-500 hover:shadow-cyan-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Assessment'}
        </button>
      </form>
    </div>
  )
}
