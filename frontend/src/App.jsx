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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8">
        {!activeToken ? (
          <div className="space-y-6">
            <div className="mb-2">
              <p className="text-sm text-gray-500">
                Create a vendor risk assessment to generate a security questionnaire,
                collect responses, and calculate a risk score.
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
                className="rounded-md border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-800 transition-colors"
              >
                &larr; Back
              </button>
              <div className="font-mono text-xs text-gray-600 truncate">
                Token: {activeToken}
              </div>
            </div>
            <Questionnaire token={activeToken} />
            <ScoreCard token={activeToken} />
          </div>
        )}

        <footer className="mt-12 border-t border-gray-800 pt-6 text-center text-xs text-gray-700">
          Scorely API &mdash; Vendor Risk Assessment Platform
        </footer>
      </main>
    </div>
  )
}
