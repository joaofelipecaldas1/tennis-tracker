import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMatches, getPlayers } from '../lib/supabase'
import MatchCard from '../components/MatchCard'
import PlayerCard from '../components/PlayerCard'
import { CourtBaseline, RacketIcon, BallIcon } from '../components/TennisDeco'
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
    <div className="space-y-0">
      {/* Hero — faixa de saibro */}
      <div className="relative overflow-hidden">
        {/* Faixa de textura de saibro no topo */}
        <div
          className="clay-strip clay-grain-strong h-1.5 w-full"
          style={{
            background: 'linear-gradient(90deg, #8B4513 0%, #C2703A 30%, #D4845A 50%, #C2703A 70%, #8B4513 100%)',
          }}
        />

        <div className="px-4 pt-5 pb-6">
          <div
            className="clay-grain rounded-2xl px-5 py-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(194,112,58,0.08) 0%, rgba(13,17,23,0) 60%)',
              border: '1px solid rgba(194,112,58,0.18)',
            }}
          >
            {/* Linhas de quadra decorativas — fundo do card */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{ opacity: 0.06 }}
            >
              {/* Linha de serviço */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-[#C2703A]" />
              {/* Linha central */}
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#C2703A]" />
            </div>

            <p
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: '#C2703A' }}
            >
              ATP Tour
            </p>
            <h1 className="text-2xl font-black text-white leading-tight">
              Acompanhe cada <br />partida, set a set.
            </h1>
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
      </div>

      {/* Baseline decorativa */}
      <div className="px-4">
        <CourtBaseline />
      </div>

      {/* Top ranking */}
      {ranking.length > 0 && (
        <section className="px-4 pt-5 pb-3 space-y-3">
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

      {/* Baseline entre seções */}
      {ranking.length > 0 && recentMatches.length > 0 && (
        <div className="px-4 py-2">
          <CourtBaseline />
        </div>
      )}

      {/* Últimas partidas */}
      {recentMatches.length > 0 && (
        <section className="px-4 pt-3 pb-10 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Últimas partidas</p>
              <RacketIcon size={11} className="text-slate-700" />
            </div>
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
          <BallIcon size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">Nenhuma partida ainda</p>
          <p className="text-slate-600 text-sm mt-1">Comece adicionando jogadores ao grupo.</p>
          <Link to="/players" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
            Adicionar jogadores →
          </Link>
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
