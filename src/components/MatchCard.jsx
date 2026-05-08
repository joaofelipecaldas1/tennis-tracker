import { useState } from 'react'
import { deleteMatch } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function MatchCard({ match, compact = false, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  const { player1, player2, winner, sets, played_at, notes } = match
  const players = [player1, player2]

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
    year: '2-digit',
  })

  return (
    <div className="bg-[#0d1117] border border-slate-800/80 rounded-xl overflow-hidden">
      {/* Set header row */}
      <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
        <span className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">Partida</span>
        <div className="flex gap-4 pr-1">
          {sets.map(s => (
            <span key={s.set_number} className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold w-5 text-center">
              {s.is_super_tiebreak ? 'STB' : `S${s.set_number}`}
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-800/60 mx-4" />

      {/* Players */}
      <div className="px-4 py-2 space-y-0.5">
        {players.map((p, idx) => {
          const isWinner = winner?.id === p?.id
          return (
            <div key={p?.id} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isWinner ? 'bg-emerald-400' : 'bg-transparent'}`} />
                <span className={`font-semibold truncate text-sm ${isWinner ? 'text-white' : 'text-slate-500'}`}>
                  {p?.name}
                </span>
              </div>
              <div className="flex gap-4 shrink-0 pl-3">
                {sets.map(s => {
                  const score = idx === 0 ? s.score_p1 : s.score_p2
                  const oppScore = idx === 0 ? s.score_p2 : s.score_p1
                  const wonSet = score > oppScore
                  return (
                    <span
                      key={s.set_number}
                      className={`tabular font-bold text-base w-5 text-center ${
                        wonSet
                          ? isWinner ? 'text-white' : 'text-slate-300'
                          : 'text-slate-600'
                      } ${s.is_super_tiebreak && wonSet ? 'text-yellow-400' : ''}`}
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

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800/60 bg-slate-900/30">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600">{date}</span>
          {notes && (
            <span className="text-xs text-slate-600 italic truncate max-w-28">"{notes}"</span>
          )}
        </div>
        {!compact && (
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/matches/${match.id}/edit`)}
              className="text-xs text-slate-500 hover:text-blue-400 transition-colors font-medium"
            >
              Editar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors font-medium disabled:opacity-40"
            >
              {deleting ? '...' : 'Excluir'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
