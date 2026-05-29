export default function TokenList({ tokens, onSelect, onDelete }) {
  if (!tokens.length) return null

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
        Previous Sessions
      </h2>
      <div className="space-y-2">
        {tokens.map((t) => (
          <div
            key={t.token}
            className="flex items-center justify-between rounded-md border border-gray-800 px-3 py-2 hover:border-gray-700"
          >
            <button
              onClick={() => onSelect(t.token)}
              className="text-left"
            >
              <div className="text-sm font-medium text-gray-200">{t.org || 'Unnamed'}</div>
              <div className="text-xs text-gray-600 font-mono">{t.token.slice(0, 8)}...</div>
            </button>
            <button
              onClick={() => onDelete(t.token)}
              className="text-xs text-gray-600 hover:text-red-400"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
