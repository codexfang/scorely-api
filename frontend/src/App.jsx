import { useState, useEffect } from 'react'
import Header from './components/Header'
import CreateAssessment from './components/CreateAssessment'
import TokenList from './components/TokenList'
import Questionnaire from './components/Questionnaire'
import ScoreCard from './components/ScoreCard'
import { getStoredTokens, storeToken, removeToken } from './services/storage'

export default function App() {
  const [tokens, setTokens] = useState([])
  const [activeToken, setActiveToken] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setTokens(getStoredTokens())
    const params = new URLSearchParams(window.location.search)
    const tokenParam = params.get('token')
    if (tokenParam) {
      setActiveToken(tokenParam)
    }
  }, [])

  function handleCreated(token, org) {
    storeToken(token, org)
    setTokens(getStoredTokens())
    setActiveToken(token)
  }

  function handleSelect(token) {
    setActiveToken(token)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleDelete(token) {
    removeToken(token)
    setTokens(getStoredTokens())
    if (activeToken === token) setActiveToken(null)
  }

  function handleBack() {
    setActiveToken(null)
    setSubmitted(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSubmitted() {
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8">
        {!activeToken ? (
          <div className="space-y-6">
            <div className="mb-2 mx-1">
              <p className="text-sm text-slate-500">
                Create a vendor risk assessment to generate a security questionnaire and calculate a risk score.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <CreateAssessment onCreated={handleCreated} />
              <TokenList
                tokens={tokens}
                onSelect={handleSelect}
                onDelete={handleDelete}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-400 transition-all hover:bg-slate-700/50 hover:text-white"
              >
                &larr; Back
              </button>
              <div className="font-mono text-xs text-slate-600 truncate">
                {activeToken.slice(0, 8)}...{activeToken.slice(-4)}
              </div>
            </div>
            <Questionnaire token={activeToken} onSubmitted={handleSubmitted} />
            {submitted && <ScoreCard token={activeToken} />}
          </div>
        )}
      </main>
    </div>
  )
}
