export default function PlayerCard({ player, rank }) {
  const { name, wins = 0, losses = 0, winRate = 0, streak = 0 } = player
  const total = wins + losses

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 text-gray-400 font-bold text-lg shrink-0">
        {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">{name}</p>
        <p className="text-xs text-gray-400">
          {total} {total === 1 ? 'jogo' : 'jogos'} · {wins}V {losses}D
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-2xl font-mono font-bold text-green-400">{winRate}%</p>
        {streak > 1 && (
          <p className="text-xs text-yellow-400">🔥 {streak} seguidas</p>
        )}
      </div>
    </div>
  )
}
