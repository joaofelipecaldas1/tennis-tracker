import { useState } from 'react'
import { deleteMatch } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

function SetScore({ set, isP1Winner }) {
  const winnerScore = isP1Winner ? set.score_p1 : set.score_p2
  const loserScore = isP1Winner ? set.score_p2 : set.score_p1
  return (
    <span className={`font-mono text-sm ${set.is_super_tiebreak ? 'text-yellow-300' : 'text-white'}`}>
      {set.score_p1}-{set.score_p2}
      {set.is_super_tiebreak && <span className="text-xs text-yellow-400 ml-0.5">sb</span>}
    </span>
  )
}

export default function MatchCard({ match, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  const { player1, player2, winner, sets, played_at, notes } = match
  const isP1Winner = winner?.id === player1?.id

  async function handleDelete() {
    if (!confirm('Excluir esta partida?')) return
    setDeleting(true)
    try {
      await deleteMatch(match.id)
      onDeleted?.(match.id)
    } catch (e) {
      alert('Erro ao excluir: ' + e.message)
      setDeleting(false)
    }
  }

  const date = new Date(played_at + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0 space-y-2">
          {[player1, player2].map((p, idx) => {
            const isWinner = winner?.id === p?.id
            return (
              <div key={p?.id} className="flex items-center justify-between gap-2">
                <span className={`font-medium truncate ${isWinner ? 'text-white' : 'text-gray-400'}`}>
                  {isWinner && <span className="text-green-400 mr-1">✓</span>}
                  {p?.name}
                </span>
                <div className="flex gap-2 shrink-0">
                  {sets.map(s => {
                    const score = idx === 0 ? s.score_p1 : s.score_p2
                    const oppScore = idx === 0 ? s.score_p2 : s.score_p1
                    const wonSet = score > oppScore
                    return (
                      <span
                        key={s.set_number}
                        className={`font-mono text-base font-bold w-6 text-center ${
                          wonSet ? 'text-white' : 'text-gray-500'
                        } ${s.is_super_tiebreak ? 'text-yellow-300' : ''}`}
                      >
                        {score}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-700">
        <span>{date}</span>
        <div className="flex gap-2">
          {notes && <span className="text-gray-500 italic truncate max-w-32">{notes}</span>}
          <button
            onClick={() => navigate(`/matches/${match.id}/edit`)}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            {deleting ? '...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}
