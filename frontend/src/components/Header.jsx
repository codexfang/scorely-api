export default function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Scorely</h1>
          <p className="text-xs text-gray-500">Vendor Risk Assessment API</p>
        </div>
        <span className="rounded-full bg-emerald-900/50 px-3 py-1 text-xs font-medium text-emerald-400">
          API Status
        </span>
      </div>
    </header>
  )
}
