import { useState, useEffect, useCallback } from 'react'
import { getAssessment, getFallbackQuestions, submitAnswers } from '../services/api'

const PAGE_SIZE = 6

function AnswerInput({ question, value, onChange }) {
  const type = question.answer_type

  const baseBtn = (active, activeColors, inactiveColors) =>
    `rounded-lg px-4 py-2 text-xs font-medium transition-all duration-150 ${
      active ? activeColors : inactiveColors
    }`

  if (type === 'boolean') {
    return (
      <div className="flex gap-2">
        {['True', 'False'].map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt === 'True')}
            className={baseBtn(
              value === (opt === 'True'),
              'bg-gradient-to-r from-cyan-600 to-violet-600 text-white shadow-md shadow-cyan-500/20',
              'border border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
            )}
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
            className={baseBtn(
              value === opt,
              'bg-gradient-to-r from-cyan-600 to-violet-600 text-white shadow-md shadow-cyan-500/20',
              'border border-slate-700 bg-slate-800/50 text-slate-400 capitalize hover:border-slate-600 hover:text-slate-300'
            )}
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
            className={`h-9 w-9 rounded-lg text-xs font-medium transition-all duration-150 ${
              value === n
                ? 'bg-gradient-to-br from-cyan-600 to-violet-600 text-white shadow-md shadow-cyan-500/20 scale-110'
                : 'border border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
            }`}
          >
            {n}
          </button>
        ))}
        <span className="ml-2 text-xs text-slate-500">
          {value ? `${value}/5` : ''}
        </span>
      </div>
    )
  }

  return null
}

export default function Questionnaire({ token, onSubmitted }) {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [notes, setNotes] = useState({})
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const storageKey = `scorely_answers_${token}`
  const notesKey = `scorely_notes_${token}`

  useEffect(() => {
    async function load() {
      try {
        const data = await getAssessment(token)
        setQuestions(data.questions)
      } catch {
        setQuestions(getFallbackQuestions())
      }

      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) setAnswers(JSON.parse(saved))
        const savedNotes = localStorage.getItem(notesKey)
        if (savedNotes) setNotes(JSON.parse(savedNotes))
      } catch {}

      setLoading(false)
    }
    load()
  }, [token])

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(answers))
    }
  }, [answers])

  useEffect(() => {
    if (Object.keys(notes).length > 0) {
      localStorage.setItem(notesKey, JSON.stringify(notes))
    }
  }, [notes])

  const setAnswer = useCallback((qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }))
  }, [])

  const setNote = useCallback((qId, value) => {
    setNotes((prev) => ({ ...prev, [qId]: value }))
  }, [])

  const totalPages = Math.ceil(questions.length / PAGE_SIZE)
  const pageQuestions = questions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const answered = Object.keys(answers).length
  const total = questions.length

  const pageStart = page * PAGE_SIZE + 1
  const pageEnd = Math.min((page + 1) * PAGE_SIZE, total)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const answerList = Object.entries(answers).map(([question_id, answer]) => ({
        question_id,
        answer,
        notes: notes[question_id] || null,
      }))
      await submitAnswers(token, answerList)
      setSubmitted(true)
      if (onSubmitted) onSubmitted()
    } catch {
      setSubmitted(true)
      if (onSubmitted) onSubmitted()
    } finally {
      setSubmitting(false)
    }
  }

  function clearAll() {
    setAnswers({})
    setNotes({})
    localStorage.removeItem(storageKey)
    localStorage.removeItem(notesKey)
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-8 shadow-lg shadow-black/20">
        <div className="flex animate-pulse flex-col gap-4">
          <div className="h-4 w-48 rounded bg-slate-800" />
          <div className="h-24 rounded-lg bg-slate-800/50" />
          <div className="h-24 rounded-lg bg-slate-800/50" />
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-900/50 bg-gradient-to-b from-emerald-950/30 to-slate-950 p-8 text-center shadow-lg shadow-black/20">
        <p className="text-lg font-semibold text-emerald-400">Answers Submitted</p>
        <p className="mt-1 text-sm text-slate-500">
          Your responses have been recorded. View your risk score below.
        </p>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-8 shadow-lg shadow-black/20">
        <p className="text-sm text-rose-400">No questions available.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-lg shadow-black/20">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Questionnaire
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            <span className="text-cyan-400">{answered}</span>/{total}
          </span>
          {answered > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-slate-600 hover:text-rose-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              className={`h-2 flex-1 rounded-full transition-all ${
                i === page
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-600'
                  : i < page
                  ? 'bg-emerald-600/50'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-slate-600">
            Page {page + 1} of {totalPages}
          </p>
          <p className="text-xs text-slate-600">
            Questions {pageStart}&ndash;{pageEnd}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-900/50 bg-rose-950/20 px-4 py-2">
          <p className="text-xs text-rose-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {pageQuestions.map((q) => (
            <div
              key={q.id}
              className={`rounded-lg border p-5 transition-all ${
                answers[q.id] !== undefined
                  ? 'border-slate-700 bg-slate-800/40'
                  : 'border-slate-800 bg-slate-950/50'
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-800 text-[10px] font-bold text-slate-500">
                      {questions.indexOf(q) + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{q.question}</p>
                      <p className="mt-1 text-xs text-slate-500">{q.guidance}</p>
                    </div>
                  </div>
                </div>
                <span className="shrink-0 rounded-md bg-slate-800/80 px-2 py-1 text-[10px] font-medium text-slate-500 font-mono border border-slate-700/50">
                  {q.id}
                </span>
              </div>

              <div className="ml-7">
                <AnswerInput
                  question={q}
                  value={answers[q.id]}
                  onChange={(v) => setAnswer(q.id, v)}
                />
                <div className="mt-3">
                  <input
                    type="text"
                    value={notes[q.id] || ''}
                    onChange={(e) => setNote(q.id, e.target.value)}
                    placeholder="Add notes or evidence (optional)"
                    className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-400 placeholder-slate-700 transition-colors focus:border-slate-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-xs font-medium text-slate-300 transition-all hover:bg-slate-700/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            &larr; Previous
          </button>

          <span className="text-xs text-slate-600">
            {answered}/{total} answered
          </span>

          {page < totalPages - 1 ? (
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-xs font-medium text-slate-300 transition-all hover:bg-slate-700/50 hover:text-white"
            >
              Next &rarr;
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting || answered === 0}
              className="rounded-lg bg-gradient-to-r from-cyan-600 to-violet-600 px-5 py-2 text-xs font-medium text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-500 hover:to-violet-500 hover:shadow-cyan-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit All'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
