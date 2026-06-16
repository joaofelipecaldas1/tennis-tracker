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

// text-base (16px) evita zoom automático no iOS Safari
const inputCls =
  'w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-white text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors'
const labelCls = 'block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide'

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
  const [isWalkover, setIsWalkover] = useState(false)
  const [walkoverWinnerId, setWalkoverWinnerId] = useState('')
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
    setIsWalkover(existingMatch.is_walkover || false)
    setWalkoverWinnerId(existingMatch.winner_id || '')
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
      setSets([
        ...base,
        {
          score_p1: String(s[2].score_p1),
          score_p2: String(s[2].score_p2),
          is_super_tiebreak: s[2].is_super_tiebreak,
        },
      ])
    } else {
      setSets(base)
    }
  }, [existingMatch])

  function updateSet(index, field, value) {
    setSets(prev => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  function toggleThirdSet(val) {
    setHasThirdSet(val)
    setSets(prev =>
      val
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
    if (player1Id === player2Id) {
      setError('Selecione dois jogadores diferentes')
      return
    }

    let winnerId
    let activeSets

    if (isWalkover) {
      if (!walkoverWinnerId) {
        setError('Selecione o vencedor do walkover')
        return
      }
      winnerId = walkoverWinnerId
      // Só salva sets que tenham ambos os placares preenchidos
      activeSets = sets
        .filter(s => s.score_p1 !== '' && s.score_p2 !== '')
        .map((s, i) => ({
          score_p1: parseInt(s.score_p1),
          score_p2: parseInt(s.score_p2),
          is_super_tiebreak: false,
        }))
    } else {
      for (let i = 0; i < sets.length; i++) {
        const err = validarSet(sets[i], i, i === 2 && thirdSetType === 'supertiebreak')
        if (err) { setError(err); return }
      }
      activeSets = sets.map((s, i) => ({
        score_p1: parseInt(s.score_p1),
        score_p2: parseInt(s.score_p2),
        is_super_tiebreak: i === 2 && thirdSetType === 'supertiebreak',
      }))
      winnerId = calcularVencedor(activeSets, player1Id, player2Id)
      if (!winnerId) {
        setError('Não foi possível determinar o vencedor. Verifique o placar.')
        return
      }
    }

    setSaving(true)
    try {
      const payload = {
        player1_id: player1Id,
        player2_id: player2Id,
        winner_id: winnerId,
        played_at: playedAt,
        notes: notes || null,
        is_walkover: isWalkover,
        sets: activeSets,
      }
      if (existingMatch) await updateMatch(existingMatch.id, payload)
      else await createMatch(payload)
      navigate('/matches')
    } catch (err) {
      setError('Erro ao salvar: ' + err.message)
      setSaving(false)
    }
  }

  const previewWinner =
    !isWalkover && player1Id && player2Id
      ? calcularVencedor(
          sets.map((s, i) => ({
            score_p1: parseInt(s.score_p1) || 0,
            score_p2: parseInt(s.score_p2) || 0,
            is_super_tiebreak: i === 2 && thirdSetType === 'supertiebreak',
          })),
          player1Id,
          player2Id
        )
      : null
  const previewWinnerName = previewWinner
    ? players.find(p => p.id === previewWinner)?.name
    : null

  const walkoverPlayers = [
    players.find(p => p.id === player1Id),
    players.find(p => p.id === player2Id),
  ].filter(Boolean)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Jogadores */}
      <div>
        <p className={labelCls}>Jogadores</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Jogador 1', player1Id, setPlayer1Id],
            ['Jogador 2', player2Id, setPlayer2Id],
          ].map(([label, val, setter]) => (
            <div key={label}>
              <label className="block text-xs text-slate-600 mb-1">{label}</label>
              <select
                required
                value={val}
                onChange={e => setter(e.target.value)}
                className={inputCls}
              >
                <option value="">Selecione...</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Toggle Walkover */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setIsWalkover(v => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
              isWalkover ? 'bg-orange-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                isWalkover ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
          <div>
            <span className={`text-base font-semibold ${isWalkover ? 'text-orange-400' : 'text-slate-400'}`}>
              Walkover
            </span>
            {isWalkover && (
              <p className="text-xs text-slate-500 mt-0.5">
                Placar parcial opcional — selecione o vencedor manualmente
              </p>
            )}
          </div>
        </label>

        {/* Seleção manual de vencedor */}
        {isWalkover && (
          <div className="mt-3">
            <label className={labelCls}>Vencedor</label>
            <select
              required
              value={walkoverWinnerId}
              onChange={e => setWalkoverWinnerId(e.target.value)}
              className={`${inputCls} border-orange-800/60 focus:border-orange-500 focus:ring-orange-500/20`}
            >
              <option value="">Selecione o vencedor...</option>
              {walkoverPlayers.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Sets */}
      <div>
        <p className={labelCls}>
          Placar dos sets
          {isWalkover && (
            <span className="ml-2 normal-case text-slate-600 font-normal tracking-normal">
              (opcional)
            </span>
          )}
        </p>
        <div className="space-y-2">
          {sets.map((s, i) => (
            <div
              key={i}
              className="bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-3"
            >
              <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold mb-2.5">
                {i === 2 && thirdSetType === 'supertiebreak'
                  ? 'Super Tie-Break'
                  : `${i + 1}º Set`}
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="99"
                  required={!isWalkover}
                  placeholder="–"
                  value={s.score_p1}
                  onChange={e => updateSet(i, 'score_p1', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-4 text-white text-center text-3xl font-black tabular focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-600 font-bold text-xl shrink-0">–</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="99"
                  required={!isWalkover}
                  placeholder="–"
                  value={s.score_p2}
                  onChange={e => updateSet(i, 'score_p2', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-4 text-white text-center text-3xl font-black tabular focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3º set */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hasThirdSet}
            onChange={e => toggleThirdSet(e.target.checked)}
            className="w-5 h-5 accent-blue-600 rounded shrink-0"
          />
          <span className="text-base text-slate-400">Adicionar 3º set</span>
        </label>
        {hasThirdSet && !isWalkover && (
          <div className="flex gap-5 ml-8">
            {[
              ['normal', 'Set normal'],
              ['supertiebreak', 'Super tie-break'],
            ].map(([val, label]) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="thirdSetType"
                  value={val}
                  checked={thirdSetType === val}
                  onChange={() => changeThirdSetType(val)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-slate-300">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Preview vencedor (só em partidas normais) */}
      {previewWinnerName && (
        <div className="flex items-center gap-2.5 bg-emerald-900/20 border border-emerald-800/40 rounded-xl px-4 py-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-sm text-emerald-400">
            Vencedor: <strong>{previewWinnerName}</strong>
          </span>
        </div>
      )}

      {/* Preview walkover */}
      {isWalkover && walkoverWinnerId && (
        <div className="flex items-center gap-2.5 bg-orange-900/20 border border-orange-800/40 rounded-xl px-4 py-3">
          <span className="text-orange-400 font-black text-xs tracking-widest">W/O</span>
          <span className="text-sm text-orange-300">
            Vencedor: <strong>{players.find(p => p.id === walkoverWinnerId)?.name}</strong>
          </span>
        </div>
      )}

      {/* Data e notas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Data</label>
          <input
            type="date"
            required
            value={playedAt}
            onChange={e => setPlayedAt(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Notas</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="opcional"
            className={inputCls}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-3">
          <span className="text-red-400 text-sm leading-snug">{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors text-base tracking-wide"
      >
        {saving
          ? 'Salvando...'
          : existingMatch
          ? 'Salvar alterações'
          : 'Registrar partida'}
      </button>
    </form>
  )
}
