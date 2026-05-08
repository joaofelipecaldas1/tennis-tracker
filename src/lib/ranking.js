export function calcularRanking(players, matches) {
  const stats = {}

  for (const p of players) {
    stats[p.id] = { ...p, wins: 0, losses: 0, streak: 0, currentStreak: 0 }
  }

  // matches já vêm ordenados por data desc — percorrer em ordem cronológica (reverso)
  const chronological = [...matches].reverse()

  for (const m of chronological) {
    const p1 = m.player1_id
    const p2 = m.player2_id
    const winner = m.winner_id

    if (!stats[p1] || !stats[p2]) continue

    if (winner === p1) {
      stats[p1].wins++
      stats[p2].losses++
      stats[p1].currentStreak++
      stats[p2].currentStreak = 0
    } else {
      stats[p2].wins++
      stats[p1].losses++
      stats[p2].currentStreak++
      stats[p1].currentStreak = 0
    }

    stats[p1].streak = Math.max(stats[p1].streak, stats[p1].currentStreak)
    stats[p2].streak = Math.max(stats[p2].streak, stats[p2].currentStreak)
  }

  return Object.values(stats)
    .filter(p => p.wins + p.losses > 0)
    .map(p => ({
      ...p,
      winRate: Math.round((p.wins / (p.wins + p.losses)) * 100),
    }))
    .sort((a, b) => {
      if (b.winRate !== a.winRate) return b.winRate - a.winRate
      return b.wins - a.wins
    })
}
