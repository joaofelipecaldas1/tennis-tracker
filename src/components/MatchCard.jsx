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
  })

  // Largura das colunas de set — alinhadas entre header e linhas de jogador
  const SET_GAP = 'gap-5'
  const SET_W = 'w-6'

  return (
    <div className="clay-border-left clay-grain bg-[#0d1117] border border-slate-800/80 rounded-xl overflow-hidden">
      {/* Header: label "Partida" + labels dos sets */}
      <div className={`flex items-center justify-between px-4 pt-2.5 pb-1.5`}>
        <span className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">Partida</span>
        <div className={`flex ${SET_GAP} shrink-0`}>
          {sets.map(s => (
            <span
              key={s.set_number}
              className={`text-[10px] uppercase tracking-wide font-semibold ${SET_W} text-center`}
              style={{ color: s.is_super_tiebreak ? '#C2703A' : '#475569' }}
            >
              {s.is_super_tiebreak ? 'TB' : `S${s.set_number}`}
            </span>
          ))}
        </div>
      </div>

      {/* Linha divisória */}
      <div
        className="h-px mx-4"
        style={{
          background:
            'linear-gradient(90deg, rgba(194,112,58,0.3) 0%, rgba(194,112,58,0.08) 100%)',
        }}
      />

      {/* Linhas de jogador */}
      <div className="px-4 py-1">
        {players.map((p, idx) => {
          const isWinner = winner?.id === p?.id
          return (
            <div key={p?.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: isWinner ? '#4ade80' : 'transparent' }}
                />
                <span
                  className={`font-semibold truncate text-sm leading-none ${
                    isWinner ? 'text-white' : 'text-slate-500'
                  }`}
                >
                  {p?.name}
                </span>
              </div>
              <div className={`flex ${SET_GAP} shrink-0 pl-2`}>
                {sets.map(s => {
                  const score = idx === 0 ? s.score_p1 : s.score_p2
                  const oppScore = idx === 0 ? s.score_p2 : s.score_p1
                  const wonSet = score > oppScore
                  return (
                    <span
                      key={s.set_number}
                      className={`tabular font-bold text-base leading-none ${SET_W} text-center`}
                      style={{
                        color:
                          s.is_super_tiebreak && wonSet
                            ? '#C2703A'
                            : wonSet
                            ? isWinner
                              ? '#ffffff'
                              : '#cbd5e1'
                            : '#334155',
                      }}
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

      {/* Rodapé */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800/60 bg-slate-900/30">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-slate-600 shrink-0">{date}</span>
          {notes && (
            <span className="text-xs text-slate-600 italic truncate max-w-24">"{notes}"</span>
          )}
        </div>
        {!compact && (
          <div className="flex shrink-0">
            <button
              onClick={() => navigate(`/matches/${match.id}/edit`)}
              className="text-xs text-slate-500 hover:text-blue-400 transition-colors font-medium px-3 py-2"
            >
              Editar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors font-medium px-3 py-2 disabled:opacity-40"
            >
              {deleting ? '...' : 'Excluir'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
