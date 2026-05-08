import { useEffect, useState } from 'react'
import { getMatches, getPlayers } from '../lib/supabase'
import PlayerCard from '../components/PlayerCard'
import { calcularRanking } from '../lib/ranking'

export default function Rankings() {
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getPlayers(), getMatches()])
      .then(([players, matches]) => {
        setRanking(calcularRanking(players, matches))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="px-4 py-6 space-y-4">
      <h1 className="text-xl font-bold text-white">Ranking</h1>

      {loading && (
        <div className="text-gray-400 text-sm text-center py-12 animate-pulse">Carregando...</div>
      )}

      {!loading && ranking.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-3xl mb-2">🏆</p>
          <p>Nenhuma partida registrada ainda.</p>
        </div>
      )}

      <div className="space-y-3">
        {ranking.map((player, i) => (
          <PlayerCard key={player.id} player={player} rank={i + 1} />
        ))}
      </div>

      {ranking.length > 0 && (
        <p className="text-xs text-gray-600 text-center pt-2">
          Ordenado por win rate · mínimo 1 partida
        </p>
      )}
    </div>
  )
}
