import type { Tournament } from '../types'

export interface PlayerStats {
  playerName: string
  totalPoints: number
  tournamentCount: number
  winCount: number        // 1位の回数
  topThreeCount: number   // 3位以内の回数
  totalPrize: number
  bestFinish: number      // 最高順位
  avgFinish: number       // 平均順位
  recentResults: {
    tournamentName: string
    date: string
    position: number
    prize: number
    points: number
  }[]
}

/**
 * 順位に応じたポイントを計算する
 * デフォルトのポイントシステム:
 *   1位: 100pt, 2位: 70pt, 3位: 50pt, 4位: 40pt, 5位: 30pt,
 *   6位: 25pt, 7位: 20pt, 8位: 15pt, 9位: 10pt, 10位以降: 5pt
 *   参加ポイント: 5pt（順位未確定でも付与）
 */
export function getPointsForPosition(position: number | undefined): number {
  if (position == null) return 5 // 参加ポイント
  const pointTable: Record<number, number> = {
    1: 100,
    2: 70,
    3: 50,
    4: 40,
    5: 30,
    6: 25,
    7: 20,
    8: 15,
    9: 10,
  }
  return pointTable[position] ?? 5
}

/**
 * トーナメント履歴からプレイヤーランキングを集計する
 */
export function aggregateLeaderboard(
  tournaments: Tournament[],
  options?: {
    startDate?: string
    endDate?: string
    searchQuery?: string
  }
): PlayerStats[] {
  // 終了済みトーナメントのみ対象
  let filtered = tournaments.filter(t => t.status === 'finished')

  if (options?.startDate) {
    filtered = filtered.filter(t => t.date >= options.startDate!)
  }
  if (options?.endDate) {
    filtered = filtered.filter(t => t.date <= options.endDate!)
  }

  // プレイヤーごとに集計
  const playerMap = new Map<string, PlayerStats>()

  for (const t of filtered) {
    for (const entry of t.entries) {
      const name = entry.playerName.trim()
      if (!name) continue

      const points = getPointsForPosition(entry.finishPosition)

      let stats = playerMap.get(name)
      if (!stats) {
        stats = {
          playerName: name,
          totalPoints: 0,
          tournamentCount: 0,
          winCount: 0,
          topThreeCount: 0,
          totalPrize: 0,
          bestFinish: Infinity,
          avgFinish: 0,
          recentResults: [],
        }
        playerMap.set(name, stats)
      }

      stats.totalPoints += points
      stats.tournamentCount += 1
      stats.totalPrize += entry.prizeAmount ?? 0

      if (entry.finishPosition != null) {
        if (entry.finishPosition === 1) stats.winCount += 1
        if (entry.finishPosition <= 3) stats.topThreeCount += 1
        if (entry.finishPosition < stats.bestFinish) {
          stats.bestFinish = entry.finishPosition
        }
      }

      stats.recentResults.push({
        tournamentName: t.name,
        date: t.date,
        position: entry.finishPosition ?? 0,
        prize: entry.prizeAmount ?? 0,
        points,
      })
    }
  }

  // 平均順位を計算 & recentResultsを日付降順にソート
  for (const stats of playerMap.values()) {
    const positionedResults = stats.recentResults.filter(r => r.position > 0)
    stats.avgFinish = positionedResults.length > 0
      ? positionedResults.reduce((sum, r) => sum + r.position, 0) / positionedResults.length
      : 0
    if (stats.bestFinish === Infinity) stats.bestFinish = 0
    stats.recentResults.sort((a, b) => b.date.localeCompare(a.date))
  }

  let result = [...playerMap.values()]

  // 検索フィルタ
  if (options?.searchQuery) {
    const query = options.searchQuery.toLowerCase()
    result = result.filter(s => s.playerName.toLowerCase().includes(query))
  }

  // ポイント降順でソート
  result.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
    if (b.winCount !== a.winCount) return b.winCount - a.winCount
    return b.tournamentCount - a.tournamentCount
  })

  return result
}
