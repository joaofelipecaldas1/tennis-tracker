const RANK_STYLES = {
  1: { bar: 'bg-yellow-400', text: 'text-yellow-400', border: 'border-l-yellow-400' },
  2: { bar: 'bg-slate-400', text: 'text-slate-300', border: 'border-l-slate-400' },
  3: { bar: 'bg-amber-600', text: 'text-amber-500', border: 'border-l-amber-600' },
}

export default function PlayerCard({ player, rank }) {
  const { name, wins = 0, losses = 0, winRate = 0, streak = 0 } = player
  const total = wins + losses
  const style = RANK_STYLES[rank] || { bar: 'bg-blue-700', text: 'text-slate-400', border: 'border-l-slate-700' }

  return (
    <div className={`bg-[#0d1117] border border-slate-800/80 border-l-2 ${style.border} rounded-xl px-4 py-3`}>
      <div className="flex items-center gap-3">
        {/* Rank */}
        <span className={`text-xs font-black w-5 text-center tabular shrink-0 ${style.text}`}>
          {rank}
        </span>

        {/* Name + stats */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm truncate">{name}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${style.bar}`}
                style={{ width: `${winRate}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 shrink-0 tabular">
              {wins}V · {losses}D · {total}J
            </span>
          </div>
        </div>

        {/* Win rate */}
        <div className="text-right shrink-0">
          <span className={`tabular font-black text-2xl ${style.text}`}>{winRate}</span>
          <span className="text-slate-500 text-sm font-semibold">%</span>
          {streak > 1 && (
            <p className="text-[10px] text-amber-400 font-semibold mt-0.5">{streak} seq.</p>
          )}
        </div>
      </div>
    </div>
  )
}
