import { useState, useEffect } from 'react'
import { getPlayers, createMatch, updateMatch } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const emptySet = { score_p1: '', score_p2: '', is_super_tiebreak: false }

function calcularVencedor(sets, p1id, p2id) {
  let winsP1 = 0
  let winsP2 = 0
  for (const s of sets) {
    const s1 = parseInt(s.score_p1)
    const s2 = parseInt(s.score_p2)
    if (isNaN(s1) || isNaN(s2)) continue
    if (s1 > s2) winsP1++
    else if (s2 > s1) winsP2++
  }
  if (winsP1 > winsP2) return p1id
  if (winsP2 > winsP1) return p2id
  return null
}

function validarSet(set, index, isSuperTb) {
  const s1 = parseInt(set.score_p1)
  const s2 = parseInt(set.score_p2)
  if (isNaN(s1) || isNaN(s2)) return 'Preencha o placar do ' + (index + 1) + 'º set'
  if (s1 < 0 || s2 < 0) return 'Placar não pode ser negativo'
  if (s1 === s2) return `${index + 1}º set: placar empatado não é válido`

  if (isSuperTb) {
    const venceu = Math.max(s1, s2)
    const perdeu = Math.min(s1, s2)
    if (venceu < 10) return 'Super tie-break: vencedor precisa ter pelo menos 10 pontos'
    if (venceu - perdeu < 2) return 'Super tie-break: diferença mínima de 2 pontos'
    return null
  }

  const venceu = Math.max(s1, s2)
  const perdeu = Math.min(s1, s2)
  if (venceu === 7 && perdeu === 6) return null // tiebreak
  if (venceu === 7 && perdeu === 5) return null
  if (venceu === 6 && perdeu <= 4) return null
  if (venceu === 6 && perdeu === 5) return null // pode acontecer no 3o set sem tiebreak
  return `${index + 1}º set: placar ${s1}-${s2} não é válido`
}

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
    if (existingMatch) {
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
      setSets(base)
      if (s.length === 3) {
        setHasThirdSet(true)
        setThirdSetType(s[2].is_super_tiebreak ? 'supertiebreak' : 'normal')
        setSets([...base, {
          score_p1: String(s[2].score_p1),
          score_p2: String(s[2].score_p2),
          is_super_tiebreak: s[2].is_super_tiebreak,
        }])
      }
    }
  }, [existingMatch])

  function updateSet(index, field, value) {
    setSets(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  function toggleThirdSet(val) {
    setHasThirdSet(val)
    if (val) {
      setSets(prev => [...prev.slice(0, 2), { ...emptySet, is_super_tiebreak: thirdSetType === 'supertiebreak' }])
    } else {
      setSets(prev => prev.slice(0, 2))
    }
  }

  function changeThirdSetType(type) {
    setThirdSetType(type)
    setSets(prev => {
      const updated = [...prev]
      if (updated[2]) updated[2] = { ...updated[2], is_super_tiebreak: type === 'supertiebreak' }
      return updated
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (player1Id === player2Id) {
      setError('Selecione dois jogadores diferentes')
      return
    }

    for (let i = 0; i < sets.length; i++) {
      const isSuperTb = i === 2 && thirdSetType === 'supertiebreak'
      const err = validarSet(sets[i], i, isSuperTb)
      if (err) { setError(err); return }
    }

    const activeSets = sets.map((s, i) => ({
      score_p1: parseInt(s.score_p1),
      score_p2: parseInt(s.score_p2),
      is_super_tiebreak: i === 2 && thirdSetType === 'supertiebreak',
    }))

    const winnerId = calcularVencedor(activeSets, player1Id, player2Id)
    if (!winnerId) {
      setError('Não foi possível determinar o vencedor. Verifique o placar.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        player1_id: player1Id,
        player2_id: player2Id,
        winner_id: winnerId,
        played_at: playedAt,
        notes: notes || null,
        sets: activeSets,
      }
      if (existingMatch) {
        await updateMatch(existingMatch.id, payload)
      } else {
        await createMatch(payload)
      }
      navigate('/matches')
    } catch (err) {
      setError('Erro ao salvar: ' + err.message)
      setSaving(false)
    }
  }

  const activeSetsForPreview = sets.map((s, i) => ({
    score_p1: parseInt(s.score_p1) || 0,
    score_p2: parseInt(s.score_p2) || 0,
    is_super_tiebreak: i === 2 && thirdSetType === 'supertiebreak',
  }))
  const previewWinner = player1Id && player2Id
    ? calcularVencedor(activeSetsForPreview, player1Id, player2Id)
    : null
  const previewWinnerName = previewWinner
    ? players.find(p => p.id === previewWinner)?.name
    : null

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Jogadores */}
      <div className="grid grid-cols-2 gap-3">
        {[['Jogador 1', player1Id, setPlayer1Id], ['Jogador 2', player2Id, setPlayer2Id]].map(([label, val, setter]) => (
          <div key={label}>
            <label className="block text-xs text-gray-400 mb-1">{label}</label>
            <select
              required
              value={val}
              onChange={e => setter(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            >
              <option value="">Selecione...</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Sets */}
      <div className="space-y-3">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Placar dos sets</p>
        {sets.map((s, i) => (
          <div key={i} className="space-y-1">
            <p className="text-xs text-gray-500">
              {i + 1}º set{i === 2 && thirdSetType === 'supertiebreak' ? ' (super tie-break)' : ''}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="99"
                required
                placeholder="0"
                value={s.score_p1}
                onChange={e => updateSet(i, 'score_p1', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-center text-lg font-mono font-bold focus:outline-none focus:border-green-500"
              />
              <span className="text-gray-500 font-bold">-</span>
              <input
                type="number"
                min="0"
                max="99"
                required
                placeholder="0"
                value={s.score_p2}
                onChange={e => updateSet(i, 'score_p2', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-center text-lg font-mono font-bold focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
        ))}
      </div>

      {/* 3º set */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hasThirdSet}
            onChange={e => toggleThirdSet(e.target.checked)}
            className="w-4 h-4 accent-green-500"
          />
          <span className="text-sm text-gray-300">Adicionar 3º set</span>
        </label>
        {hasThirdSet && (
          <div className="flex gap-3 ml-6">
            {[['normal', 'Set normal'], ['supertiebreak', 'Super tie-break']].map(([val, label]) => (
              <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="thirdSetType"
                  value={val}
                  checked={thirdSetType === val}
                  onChange={() => changeThirdSetType(val)}
                  className="accent-green-500"
                />
                <span className="text-sm text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Preview vencedor */}
      {previewWinnerName && (
        <div className="bg-green-900/30 border border-green-700/50 rounded-lg px-4 py-2 text-sm text-green-400">
          Vencedor: <strong>{previewWinnerName}</strong>
        </div>
      )}

      {/* Data e notas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Data</label>
          <input
            type="date"
            required
            value={playedAt}
            onChange={e => setPlayedAt(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Notas (opcional)</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ex: jogo épico!"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-gray-900 font-bold py-3 rounded-xl transition-colors text-sm"
      >
        {saving ? 'Salvando...' : existingMatch ? 'Salvar alterações' : 'Registrar partida'}
      </button>
    </form>
  )
}
