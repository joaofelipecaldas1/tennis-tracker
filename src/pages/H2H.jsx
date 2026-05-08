import { useEffect, useState, useMemo } from 'react'
import { getPlayers, getMatches } from '../lib/supabase'
import MatchCard from '../components/MatchCard'
import { CourtBaseline } from '../components/TennisDeco'

function StatBox({ label, value, sub, highlight }) {
  return (
    <div
      className={`flex-1 text-center px-3 py-5 rounded-xl border ${
        highlight
          ? 'bg-blue-900/20 border-blue-800/40'
          : 'bg-[#0d1117] border-slate-800/80'
      }`}
    >
      <p
        className={`tabular font-black text-5xl leading-none ${
          highlight ? 'text-white' : 'text-slate-500'
        }`}
      >
        {value}
      </p>
      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-2">
        {label}
      </p>
      {sub != null && (
        <p
          className={`tabular text-sm font-bold mt-1 ${
            highlight ? 'text-blue-400' : 'text-slate-600'
          }`}
        >
          {sub}%
        </p>
      )}
    </div>
  )
}

// text-base evita zoom automático no iOS Safari
const selectCls =
  'w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-white text-base font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors'

export default function H2H() {
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [p1Id, setP1Id] = useState('')
  const [p2Id, setP2Id] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getPlayers(), getMatches()])
      .then(([pl, ma]) => { setPlayers(pl); setMatches(ma) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const p1 = players.find(p => p.id === p1Id)
  const p2 = players.find(p => p.id === p2Id)

  const h2hMatches = useMemo(() => {
    if (!p1Id || !p2Id) return []
    return matches.filter(
      m =>
        (m.player1_id === p1Id && m.player2_id === p2Id) ||
        (m.player1_id === p2Id && m.player2_id === p1Id)
    )
  }, [matches, p1Id, p2Id])

  const stats = useMemo(() => {
    const total = h2hMatches.length
    const winsP1 = h2hMatches.filter(m => m.winner_id === p1Id).length
    const winsP2 = total - winsP1
    const rateP1 = total > 0 ? Math.round((winsP1 / total) * 100) : 0
    const rateP2 = total > 0 ? Math.round((winsP2 / total) * 100) : 0
    return { total, winsP1, winsP2, rateP1, rateP2 }
  }, [h2hMatches, p1Id, p2Id])

  return (
    <div className="px-4 py-6">
      <div className="mb-4">
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: '#C2703A' }}
        >
          Confronto direto
        </p>
        <h1 className="text-2xl font-black text-white">Head to Head</h1>
      </div>

      <CourtBaseline className="mb-5" />

      {loading ? (
        <div className="text-slate-600 text-sm text-center py-12 animate-pulse">
          Carregando...
        </div>
      ) : (
        <>
          {/* Seleção de jogadores */}
          <div className="space-y-3 mb-6">
            <select
              value={p1Id}
              onChange={e => setP1Id(e.target.value)}
              className={selectCls}
            >
              <option value="">Selecione o Jogador 1...</option>
              {players
                .filter(p => p.id !== p2Id)
                .map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-slate-600 font-black text-xs tracking-widest uppercase">
                VS
              </span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            <select
              value={p2Id}
              onChange={e => setP2Id(e.target.value)}
              className={selectCls}
            >
              <option value="">Selecione o Jogador 2...</option>
              {players
                .filter(p => p.id !== p1Id)
                .map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Stats */}
          {p1Id && p2Id && (
            <div className="space-y-5">
              {stats.total === 0 ? (
                <div className="text-center py-10 bg-[#0d1117] border border-slate-800/80 rounded-xl">
                  <p className="text-slate-400 font-semibold">{p1?.name} vs {p2?.name}</p>
                  <p className="text-slate-600 text-sm mt-1">
                    Esses jogadores ainda não se enfrentaram.
                  </p>
                </div>
              ) : (
                <>
                  {/* Nomes dos jogadores */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-black text-white text-sm truncate flex-1 text-left">
                      {p1?.name}
                    </p>
                    <span className="text-slate-700 font-black text-xs shrink-0 px-1">VS</span>
                    <p className="font-black text-white text-sm truncate flex-1 text-right">
                      {p2?.name}
                    </p>
                  </div>

                  {/* Stat boxes */}
                  <div className="flex gap-3 items-stretch">
                    <StatBox
                      label="Vitórias"
                      value={stats.winsP1}
                      sub={stats.rateP1}
                      highlight={stats.winsP1 > stats.winsP2}
                    />
                    <div className="flex flex-col items-center justify-center px-1 shrink-0">
                      <p className="tabular font-black text-2xl text-slate-700 leading-none">
                        {stats.total}
                      </p>
                      <p className="text-[9px] text-slate-700 uppercase tracking-widest font-semibold mt-1">
                        jogos
                      </p>
                    </div>
                    <StatBox
                      label="Vitórias"
                      value={stats.winsP2}
                      sub={stats.rateP2}
                      highlight={stats.winsP2 > stats.winsP1}
                    />
                  </div>

                  {/* Barra de dominância */}
                  <div className="space-y-2">
                    <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-800">
                      <div
                        className="bg-blue-600 transition-all duration-500"
                        style={{ width: `${stats.rateP1}%` }}
                      />
                      <div
                        className="bg-slate-600 transition-all duration-500"
                        style={{ width: `${stats.rateP2}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-600 font-semibold">
                      <span className="truncate max-w-[45%]">{p1?.name}</span>
                      <span className="truncate max-w-[45%] text-right">{p2?.name}</span>
                    </div>
                  </div>

                  <CourtBaseline />

                  {/* Histórico */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Histórico de confrontos
                    </p>
                    <div className="space-y-3">
                      {h2hMatches.map(m => (
                        <MatchCard key={m.id} match={m} compact />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {(!p1Id || !p2Id) && (
            <div className="text-center py-16 text-slate-600">
              <p className="text-slate-500 font-semibold">Selecione dois jogadores</p>
              <p className="text-sm mt-1">
                para ver o histórico de confrontos diretos.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
