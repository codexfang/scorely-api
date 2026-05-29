export default function TokenList({ tokens, onSelect, onDelete }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-lg shadow-black/20">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
        History
      </h2>
      {tokens.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-800 py-8 text-center">
          <p className="text-xs text-slate-600">No assessments yet</p>
          <p className="mt-1 text-[11px] text-slate-700">Create one to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tokens.map((t) => (
            <div
              key={t.token}
              className="group flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-3.5 py-2.5 transition-all hover:border-slate-700 hover:bg-slate-900/80"
            >
              <button
                onClick={() => onSelect(t.token)}
                className="flex-1 text-left"
              >
                <div>
                  <div className="text-sm font-medium text-slate-200">{t.org || 'Unnamed'}</div>
                  <div className="text-xs text-slate-600 font-mono">{t.token.slice(0, 8)}...</div>
                </div>
              </button>
              <button
                onClick={() => onDelete(t.token)}
                className="rounded-md px-2 py-1 text-xs text-slate-600 opacity-0 transition-all hover:text-rose-400 group-hover:opacity-100"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
