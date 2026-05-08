import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMatches } from '../lib/supabase'
import MatchCard from '../components/MatchCard'

export default function Matches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMatches()
      .then(setMatches)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function handleDeleted(id) {
    setMatches(prev => prev.filter(m => m.id !== id))
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Histórico</p>
          <h1 className="text-2xl font-black text-white">Partidas</h1>
        </div>
        <Link
          to="/matches/new"
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Nova
        </Link>
      </div>

      {loading && (
        <div className="text-slate-600 text-sm text-center py-12 animate-pulse">Carregando...</div>
      )}

      {!loading && matches.length === 0 && (
        <div className="text-center py-16 text-slate-600">
          <p className="font-semibold text-slate-500 mb-1">Nenhuma partida ainda</p>
          <p className="text-sm">Registre a primeira partida para começar.</p>
        </div>
      )}

      <div className="space-y-3">
        {matches.map(m => (
          <MatchCard key={m.id} match={m} onDeleted={handleDeleted} />
        ))}
      </div>
    </div>
  )
}
