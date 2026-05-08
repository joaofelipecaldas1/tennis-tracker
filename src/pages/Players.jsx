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
    if (!confirm(`Excluir ${name}? Todas as partidas do jogador também serão excluídas.`)) return
    try {
      await deletePlayer(id)
      setPlayers(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert('Erro ao excluir: ' + err.message)
    }
  }

  return (
    <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-white">Jogadores</h1>

      {/* Adicionar jogador */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Nome do jogador"
          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500"
        />
        <button
          type="submit"
          disabled={saving || !newName.trim()}
          className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-gray-900 font-bold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {saving ? '...' : 'Adicionar'}
        </button>
      </form>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {loading && (
        <div className="text-gray-400 text-sm text-center py-8 animate-pulse">Carregando...</div>
      )}

      {!loading && players.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-3xl mb-2">👤</p>
          <p>Nenhum jogador cadastrado.</p>
        </div>
      )}

      <div className="space-y-2">
        {players.map(p => (
          <div
            key={p.id}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 flex items-center justify-between"
          >
            <span className="text-white font-medium">{p.name}</span>
            <button
              onClick={() => handleDelete(p.id, p.name)}
              className="text-red-400 hover:text-red-300 text-sm transition-colors"
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
