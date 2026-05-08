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
      <div className="px-4 pt-8 pb-4">
        <div className="bg-gradient-to-br from-blue-900/30 to-slate-900/0 border border-blue-900/30 rounded-2xl px-6 py-6">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1">ATP Tour</p>
          <h1 className="text-2xl font-black text-white leading-tight">Acompanhe cada <br />partida, set a set.</h1>
          <p className="text-slate-500 text-sm mt-2">
            {matches.length} {matches.length === 1 ? 'partida' : 'partidas'} registradas
            {players.length > 0 ? ` · ${players.length} jogadores` : ''}
          </p>
          <Link
            to="/matches/new"
            className="inline-flex items-center gap-2 mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            + Nova partida
          </Link>
        </div>
      </div>

      {/* Top ranking */}
      {ranking.length > 0 && (
        <section className="px-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Ranking</p>
            <Link to="/rankings" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Ver tudo →
            </Link>
          </div>
          {ranking.map((p, i) => (
            <PlayerCard key={p.id} player={p} rank={i + 1} />
          ))}
        </section>
      )}

      {/* Últimas partidas */}
      {recentMatches.length > 0 && (
        <section className="px-4 space-y-3 pb-8">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Últimas partidas</p>
            <Link to="/matches" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Ver tudo →
            </Link>
          </div>
          {recentMatches.map(m => (
            <MatchCard key={m.id} match={m} onDeleted={handleDeleted} />
          ))}
        </section>
      )}

      {matches.length === 0 && players.length === 0 && (
        <div className="px-4 py-16 text-center">
          <p className="text-slate-600 text-sm">Comece adicionando jogadores e registrando a primeira partida.</p>
          <div className="flex gap-3 justify-center mt-4">
            <Link to="/players" className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Adicionar jogadores →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-slate-600 text-sm animate-pulse">Carregando...</div>
    </div>
  )
}
