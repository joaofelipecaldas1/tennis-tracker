import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMatches } from '../lib/supabase'
import AddMatchForm from '../components/AddMatchForm'

export default function EditMatch() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMatches()
      .then(matches => {
        const found = matches.find(m => m.id === id)
        if (!found) { navigate('/matches'); return }
        setMatch(found)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="text-gray-400 text-sm text-center py-12 animate-pulse">Carregando...</div>
  )

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-white mb-6">Editar partida</h1>
      {match && <AddMatchForm existingMatch={match} />}
    </div>
  )
}
