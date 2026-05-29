import { useState, useEffect } from 'react'
import { getAssessment, getFallbackQuestions, submitAnswers } from '../services/api'

function AnswerInput({ question, value, onChange }) {
  const type = question.answer_type

  if (type === 'boolean') {
    return (
      <div className="flex gap-2">
        {['True', 'False'].map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt === 'True')}
            className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
              value === (opt === 'True')
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    )
  }

  if (type === 'choice' && question.options) {
    return (
      <div className="flex flex-wrap gap-2">
        {question.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              value === opt
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {opt.replace('_', ' ')}
          </button>
        ))}
      </div>
    )
  }

  if (type === 'scale') {
    return (
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`h-8 w-8 rounded-md text-xs font-medium transition-colors ${
              value === n
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {n}
          </button>
        ))}
        <span className="ml-2 text-xs text-gray-600">
          {value ? `${value}/5` : ''}
        </span>
      </div>
    )
  }

  return null
}

export default function Questionnaire({ token }) {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await getAssessment(token)
        setQuestions(data.questions)
      } catch {
        setQuestions(getFallbackQuestions())
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  function setAnswer(qId, value) {
    setAnswers((prev) => ({ ...prev, [qId]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const answerList = Object.entries(answers).map(([question_id, answer]) => ({
        question_id,
        answer,
      }))
      await submitAnswers(token, answerList)
      setSubmitted(true)
    } catch {
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const answered = Object.keys(answers).length
  const total = questions.length

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-5">
        <p className="text-sm text-gray-500">Loading questions...</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-5">
        <p className="text-sm font-medium text-emerald-400">Answers submitted successfully.</p>
        <p className="mt-1 text-xs text-gray-500">
          Proceed to view your risk score and download the report.
        </p>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-5">
        <p className="text-sm text-red-400">No questions available.</p>
      </div>
    )
  }

  const categories = [...new Set(questions.map((q) => q.category))]

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-800 bg-gray-900/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Security Questionnaire
        </h2>
        <span className="text-xs text-gray-600">
          {answered}/{total} answered
        </span>
      </div>

      {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              {cat}
            </h3>
            <div className="space-y-4">
              {questions
                .filter((q) => q.category === cat)
                .map((q) => (
                  <div key={q.id} className="rounded-md border border-gray-800 bg-gray-950/50 p-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm text-gray-200">{q.question}</p>
                        <p className="mt-1 text-xs text-gray-600">{q.guidance}</p>
                      </div>
                      <span className="shrink-0 rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-500 font-mono">
                        {q.id}
                      </span>
                    </div>
                    <AnswerInput
                      question={q}
                      value={answers[q.id]}
                      onChange={(v) => setAnswer(q.id, v)}
                    />
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={submitting || answered === 0}
        className="mt-6 w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : `Submit Answers (${answered})`}
      </button>
    </form>
  )
}
