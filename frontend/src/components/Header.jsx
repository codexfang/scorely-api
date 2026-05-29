export default function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 text-xs font-bold text-white shadow-lg shadow-cyan-500/20">
            S
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Scorely</h1>
            <p className="text-xs text-slate-500">Vendor Risk Assessment</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-950/40 px-3 py-1.5 border border-emerald-900/50">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs font-medium text-emerald-400">Connected</span>
        </div>
      </div>
    </header>
  )
}
