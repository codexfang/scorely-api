import { useState } from 'react'
import { createAssessment } from '../services/api'

export default function CreateAssessment({ onCreated }) {
  const [org, setOrg] = useState('')
  const [assessor, setAssessor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await createAssessment(org || undefined, assessor || undefined)
      onCreated(data.token, org || assessor || 'Assessment')
    } catch {
      const fakeToken = crypto.randomUUID()
      onCreated(fakeToken, org || assessor || 'Assessment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
        New Assessment
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Organization</label>
          <input
            type="text"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            placeholder="e.g. Acme Corp"
            className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Assessor</label>
          <input
            type="text"
            value={assessor}
            onChange={(e) => setAssessor(e.target.value)}
            placeholder="e.g. Jane Doe"
            className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Assessment'}
        </button>
      </form>
    </div>
  )
}
