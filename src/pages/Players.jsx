import { useEffect, useState } from 'react'
import { getPlayers, createPlayer, deletePlayer } from '../lib/supabase'

export default function Players() {
  const [players, setPlayers] = useState([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getPlayers()
      .then(setPlayers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setError('')
    setSaving(true)
    try {
      const player = await createPlayer(name)
      setPlayers(prev => [...prev, player].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName('')
    } catch (err) {
      setError(err.message.includes('unique') ? 'Jogador já existe' : 'Erro: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Excluir ${name}? Todas as partidas também serão excluídas.`)) return
    try {
      await deletePlayer(id)
      setPlayers(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert('Erro ao excluir: ' + err.message)
    }
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="mb-6">
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: '#C2703A' }}
        >
          Gestão
        </p>
        <h1 className="text-2xl font-black text-white">Jogadores</h1>
      </div>

      {/* Formulário para adicionar */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Nome do jogador"
          autoCapitalize="words"
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
        />
        <button
          type="submit"
          disabled={saving || !newName.trim()}
          className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors shrink-0"
        >
          {saving ? '...' : 'Adicionar'}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {loading && (
        <div className="text-slate-600 text-sm text-center py-8 animate-pulse">
          Carregando...
        </div>
      )}

      {!loading && players.length === 0 && (
        <div className="text-center py-10 text-slate-600">
          <p className="font-semibold text-slate-500 mb-1">Nenhum jogador</p>
          <p className="text-sm">Adicione os jogadores do grupo para começar.</p>
        </div>
      )}

      <div className="space-y-2">
        {players.map(p => (
          <div
            key={p.id}
            className="bg-[#0d1117] border border-slate-800 rounded-xl flex items-center justify-between overflow-hidden"
          >
            <span className="text-white font-semibold text-sm px-4 py-4 flex-1 truncate">
              {p.name}
            </span>
            <button
              onClick={() => handleDelete(p.id, p.name)}
              className="text-slate-600 hover:text-red-400 active:text-red-500 transition-colors font-medium text-sm px-5 py-4 shrink-0 border-l border-slate-800"
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
