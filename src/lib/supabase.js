import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- Jogadores ---

export async function getPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function createPlayer(name) {
  const { data, error } = await supabase
    .from('players')
    .insert({ name })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePlayer(id) {
  const { error } = await supabase.from('players').delete().eq('id', id)
  if (error) throw error
}

// --- Partidas ---

export async function getMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      player1:player1_id(id, name),
      player2:player2_id(id, name),
      winner:winner_id(id, name),
      sets(*)
    `)
    .order('played_at', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(m => ({
    ...m,
    sets: (m.sets || []).sort((a, b) => a.set_number - b.set_number),
  }))
}

export async function createMatch({ player1_id, player2_id, winner_id, played_at, notes, sets }) {
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .insert({ player1_id, player2_id, winner_id, played_at, notes })
    .select()
    .single()
  if (matchError) throw matchError

  const setsToInsert = sets.map((s, i) => ({
    match_id: match.id,
    set_number: i + 1,
    score_p1: s.score_p1,
    score_p2: s.score_p2,
    is_super_tiebreak: s.is_super_tiebreak || false,
  }))

  const { error: setsError } = await supabase.from('sets').insert(setsToInsert)
  if (setsError) throw setsError

  return match
}

export async function updateMatch(id, { player1_id, player2_id, winner_id, played_at, notes, sets }) {
  const { error: matchError } = await supabase
    .from('matches')
    .update({ player1_id, player2_id, winner_id, played_at, notes })
    .eq('id', id)
  if (matchError) throw matchError

  const { error: deleteError } = await supabase.from('sets').delete().eq('match_id', id)
  if (deleteError) throw deleteError

  const setsToInsert = sets.map((s, i) => ({
    match_id: id,
    set_number: i + 1,
    score_p1: s.score_p1,
    score_p2: s.score_p2,
    is_super_tiebreak: s.is_super_tiebreak || false,
  }))

  const { error: setsError } = await supabase.from('sets').insert(setsToInsert)
  if (setsError) throw setsError
}

export async function deleteMatch(id) {
  const { error } = await supabase.from('matches').delete().eq('id', id)
  if (error) throw error
}
