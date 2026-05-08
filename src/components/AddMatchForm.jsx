import { useState, useEffect } from 'react'
import { getPlayers, createMatch, updateMatch } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const emptySet = { score_p1: '', score_p2: '', is_super_tiebreak: false }

function calcularVencedor(sets, p1id, p2id) {
  let w1 = 0, w2 = 0
  for (const s of sets) {
    const s1 = parseInt(s.score_p1), s2 = parseInt(s.score_p2)
    if (isNaN(s1) || isNaN(s2)) continue
    if (s1 > s2) w1++
    else if (s2 > s1) w2++
  }
  if (w1 > w2) return p1id
  if (w2 > w1) return p2id
  return null
}

function validarSet(set, index, isSuperTb) {
  const s1 = parseInt(set.score_p1), s2 = parseInt(set.score_p2)
  if (isNaN(s1) || isNaN(s2)) return `Preencha o placar do ${index + 1}º set`
  if (s1 < 0 || s2 < 0) return 'Placar não pode ser negativo'
  if (s1 === s2) return `${index + 1}º set: placar empatado não é válido`
  if (isSuperTb) {
    const v = Math.max(s1, s2), p = Math.min(s1, s2)
    if (v < 10) return 'Super tie-break: vencedor precisa de pelo menos 10 pontos'
    if (v - p < 2) return 'Super tie-break: diferença mínima de 2 pontos'
    return null
  }
  const v = Math.max(s1, s2), p = Math.min(s1, s2)
  if ((v === 6 && p <= 5) || (v === 7 && (p === 5 || p === 6))) return null
  return `${index + 1}º set: placar ${s1}-${s2} não é válido`
}

const inputCls = "w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
const labelCls = "block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide"

export default function AddMatchForm({ existingMatch }) {
  const navigate = useNavigate()
  const [players, setPlayers] = useState([])
  const [player1Id, setPlayer1Id] = useState('')
  const [player2Id, setPlayer2Id] = useState('')
  const [playedAt, setPlayedAt] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [sets, setSets] = useState([{ ...emptySet }, { ...emptySet }])
  const [hasThirdSet, setHasThirdSet] = useState(false)
  const [thirdSetType, setThirdSetType] = useState('normal')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getPlayers().then(setPlayers).catch(console.error)
  }, [])

  useEffect(() => {
    if (!existingMatch) return
    setPlayer1Id(existingMatch.player1_id)
    setPlayer2Id(existingMatch.player2_id)
    setPlayedAt(existingMatch.played_at)
    setNotes(existingMatch.notes || '')
    const s = existingMatch.sets || []
    const base = s.slice(0, 2).map(x => ({
      score_p1: String(x.score_p1),
      score_p2: String(x.score_p2),
      is_super_tiebreak: x.is_super_tiebreak,
    }))
    while (base.length < 2) base.push({ ...emptySet })
    if (s.length === 3) {
      setHasThirdSet(true)
      setThirdSetType(s[2].is_super_tiebreak ? 'supertiebreak' : 'normal')
      setSets([...base, { score_p1: String(s[2].score_p1), score_p2: String(s[2].score_p2), is_super_tiebreak: s[2].is_super_tiebreak }])
    } else {
      setSets(base)
    }
  }, [existingMatch])

  function updateSet(index, field, value) {
    setSets(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  function toggleThirdSet(val) {
    setHasThirdSet(val)
    setSets(prev => val
      ? [...prev.slice(0, 2), { ...emptySet, is_super_tiebreak: thirdSetType === 'supertiebreak' }]
      : prev.slice(0, 2)
    )
  }

  function changeThirdSetType(type) {
    setThirdSetType(type)
    setSets(prev => {
      const u = [...prev]
      if (u[2]) u[2] = { ...u[2], is_super_tiebreak: type === 'supertiebreak' }
      return u
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (player1Id === player2Id) { setError('Selecione dois jogadores diferentes'); return }
    for (let i = 0; i < sets.length; i++) {
      const err = validarSet(sets[i], i, i === 2 && thirdSetType === 'supertiebreak')
      if (err) { setError(err); return }
    }
    const activeSets = sets.map((s, i) => ({
      score_p1: parseInt(s.score_p1),
      score_p2: parseInt(s.score_p2),
      is_super_tiebreak: i === 2 && thirdSetType === 'supertiebreak',
    }))
    const winnerId = calcularVencedor(activeSets, player1Id, player2Id)
    if (!winnerId) { setError('Não foi possível determinar o vencedor. Verifique o placar.'); return }
    setSaving(true)
    try {
      const payload = { player1_id: player1Id, player2_id: player2Id, winner_id: winnerId, played_at: playedAt, notes: notes || null, sets: activeSets }
      if (existingMatch) await updateMatch(existingMatch.id, payload)
      else await createMatch(payload)
      navigate('/matches')
    } catch (err) {
      setError('Erro ao salvar: ' + err.message)
      setSaving(false)
    }
  }

  const previewWinner = player1Id && player2Id
    ? calcularVencedor(
        sets.map((s, i) => ({ score_p1: parseInt(s.score_p1) || 0, score_p2: parseInt(s.score_p2) || 0, is_super_tiebreak: i === 2 && thirdSetType === 'supertiebreak' })),
        player1Id, player2Id
      )
    : null
  const previewWinnerName = previewWinner ? players.find(p => p.id === previewWinner)?.name : null

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Jogadores */}
      <div>
        <p className={labelCls}>Jogadores</p>
        <div className="grid grid-cols-2 gap-3">
          {[['Jogador 1', player1Id, setPlayer1Id], ['Jogador 2', player2Id, setPlayer2Id]].map(([label, val, setter]) => (
            <div key={label}>
              <label className="block text-xs text-slate-600 mb-1">{label}</label>
              <select required value={val} onChange={e => setter(e.target.value)} className={inputCls}>
                <option value="">Selecione...</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Sets */}
      <div>
        <p className={labelCls}>Placar dos sets</p>
        <div className="space-y-2">
          {sets.map((s, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-3">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold mb-2">
                {i === 2 && thirdSetType === 'supertiebreak' ? 'Super Tie-Break' : `${i + 1}º Set`}
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number" min="0" max="99" required placeholder="0"
                  value={s.score_p1}
                  onChange={e => updateSet(i, 'score_p1', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-3 text-white text-center text-2xl font-black tabular focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-600 font-bold text-lg">–</span>
                <input
                  type="number" min="0" max="99" required placeholder="0"
                  value={s.score_p2}
                  onChange={e => updateSet(i, 'score_p2', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-3 text-white text-center text-2xl font-black tabular focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3º set */}
      <div className="space-y-2">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox" checked={hasThirdSet}
            onChange={e => toggleThirdSet(e.target.checked)}
            className="w-4 h-4 accent-blue-600 rounded"
          />
          <span className="text-sm text-slate-400 group-hover:text-white transition-colors">Adicionar 3º set</span>
        </label>
        {hasThirdSet && (
          <div className="flex gap-4 ml-6">
            {[['normal', 'Set normal'], ['supertiebreak', 'Super tie-break']].map(([val, label]) => (
              <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="thirdSetType" value={val} checked={thirdSetType === val} onChange={() => changeThirdSetType(val)} className="accent-blue-600" />
                <span className="text-sm text-slate-300">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Preview vencedor */}
      {previewWinnerName && (
        <div className="flex items-center gap-2 bg-emerald-900/20 border border-emerald-800/40 rounded-lg px-4 py-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-sm text-emerald-400">Vencedor: <strong>{previewWinnerName}</strong></span>
        </div>
      )}

      {/* Data e notas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Data</label>
          <input type="date" required value={playedAt} onChange={e => setPlayedAt(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Notas</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="opcional" className={inputCls} />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/40 rounded-lg px-4 py-2.5">
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      <button
        type="submit" disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm tracking-wide"
      >
        {saving ? 'Salvando...' : existingMatch ? 'Salvar alterações' : 'Registrar partida'}
      </button>
    </form>
  )
}
