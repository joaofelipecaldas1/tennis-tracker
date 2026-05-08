import { useEffect, useState } from 'react'
import { getMatches, getPlayers } from '../lib/supabase'
import PlayerCard from '../components/PlayerCard'
import { calcularRanking } from '../lib/ranking'

export default function Rankings() {
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getPlayers(), getMatches()])
      .then(([players, matches]) => setRanking(calcularRanking(players, matches)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="px-4 py-6">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">ATP Tour</p>
          <h1 className="text-2xl font-black text-white">Ranking</h1>
        </div>
        {ranking.length > 0 && (
          <span className="text-xs text-slate-600">{ranking.length} jogadores</span>
        )}
      </div>

      {loading && (
        <div className="text-slate-600 text-sm text-center py-12 animate-pulse">Carregando...</div>
      )}

      {!loading && ranking.length === 0 && (
        <div className="text-center py-16 text-slate-600">
          <p className="font-semibold text-slate-500 mb-1">Sem dados ainda</p>
          <p className="text-sm">Registre partidas para gerar o ranking.</p>
        </div>
      )}

      <div className="space-y-2">
        {ranking.map((player, i) => (
          <PlayerCard key={player.id} player={player} rank={i + 1} />
        ))}
      </div>

      {ranking.length > 0 && (
        <p className="text-[10px] text-slate-700 text-center pt-4 uppercase tracking-widest">
          Ordenado por win rate · mínimo 1 partida
        </p>
      )}
    </div>
  )
}
