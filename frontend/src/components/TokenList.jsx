export default function TokenList({ tokens, onSelect, onDelete }) {
  if (!tokens.length) return null

  return (
    <div className="rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-lg shadow-black/20">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-cyan-600 text-xs font-bold text-white shadow-sm">
          H
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          History
        </h2>
      </div>
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
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-xs font-bold text-violet-400">
                  {t.org ? t.org[0].toUpperCase() : '?'}
                </span>
                <div>
                  <div className="text-sm font-medium text-slate-200">{t.org || 'Unnamed'}</div>
                  <div className="text-xs text-slate-600 font-mono">{t.token.slice(0, 8)}...</div>
                </div>
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
    </div>
  )
}
