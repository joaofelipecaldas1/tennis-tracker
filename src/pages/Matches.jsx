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
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Partidas</h1>
        <Link
          to="/matches/new"
          className="bg-green-500 hover:bg-green-400 text-gray-900 font-bold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Nova
        </Link>
      </div>

      {loading && (
        <div className="text-gray-400 text-sm text-center py-12 animate-pulse">Carregando...</div>
      )}

      {!loading && matches.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-3xl mb-2">📋</p>
          <p>Nenhuma partida registrada ainda.</p>
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
