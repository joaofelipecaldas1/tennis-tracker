import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMatches, getPlayers } from '../lib/supabase'
import MatchCard from '../components/MatchCard'
import PlayerCard from '../components/PlayerCard'
import { calcularRanking } from '../lib/ranking'

export default function Home() {
  const [matches, setMatches] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMatches(), getPlayers()])
      .then(([m, p]) => { setMatches(m); setPlayers(p) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function handleDeleted(id) {
    setMatches(prev => prev.filter(m => m.id !== id))
  }

  const ranking = calcularRanking(players, matches).slice(0, 3)
  const recentMatches = matches.slice(0, 5)

  if (loading) return <LoadingScreen />

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-6 px-4">
        <h1 className="text-3xl font-bold text-white mb-1">🎾 Tennis Tracker</h1>
        <p className="text-gray-400 text-sm">Registre e acompanhe suas partidas</p>
      </div>

      {/* Ação rápida */}
      <div className="px-4">
        <Link
          to="/matches/new"
          className="block w-full bg-green-500 hover:bg-green-400 text-gray-900 font-bold text-center py-3 rounded-xl transition-colors"
        >
          + Registrar partida
        </Link>
      </div>

      {/* Top ranking */}
      {ranking.length > 0 && (
        <section className="px-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Top 3</h2>
            <Link to="/rankings" className="text-xs text-green-400 hover:text-green-300">Ver tudo</Link>
          </div>
          {ranking.map((p, i) => (
            <PlayerCard key={p.id} player={p} rank={i + 1} />
          ))}
        </section>
      )}

      {/* Últimas partidas */}
      {recentMatches.length > 0 && (
        <section className="px-4 space-y-3 pb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Últimas partidas</h2>
            <Link to="/matches" className="text-xs text-green-400 hover:text-green-300">Ver tudo</Link>
          </div>
          {recentMatches.map(m => (
            <MatchCard key={m.id} match={m} onDeleted={handleDeleted} />
          ))}
        </section>
      )}

      {matches.length === 0 && players.length === 0 && (
        <div className="px-4 py-12 text-center text-gray-500">
          <p className="text-4xl mb-3">🎾</p>
          <p className="font-medium text-gray-300">Nenhuma partida ainda</p>
          <p className="text-sm mt-1">Adicione jogadores e registre a primeira partida!</p>
        </div>
      )}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-gray-400 text-sm animate-pulse">Carregando...</div>
    </div>
  )
}
