import type { TournamentEntry, Table } from '../types'

export interface TableAssignment {
  tableId: string
  tableName: string
  entries: TournamentEntry[]
}

/**
 * プレイヤーをテーブルに均等に割り当てる
 * - テーブル数を自動決定（maxPlayersPerTable基準）
 * - 人数差が最大1になるよう均等化
 */
export function assignPlayersToTables(
  entries: TournamentEntry[],
  tables: Table[],
  maxPlayersPerTable: number = 9,
): TableAssignment[] {
  // アクティブなエントリーのみ対象
  const activeEntries = entries.filter(e => !e.eliminatedAt)
  if (activeEntries.length === 0 || tables.length === 0) return []

  // 必要テーブル数を計算
  const neededTables = Math.ceil(activeEntries.length / maxPlayersPerTable)
  const availableTables = tables.slice(0, Math.min(neededTables, tables.length))

  if (availableTables.length === 0) return []

  // テーブル数分のバケットを作成
  const tableCount = availableTables.length
  const assignments: TableAssignment[] = availableTables.map(t => ({
    tableId: t.id,
    tableName: t.name,
    entries: [],
  }))

  // プレイヤーをシャッフル（公平性のため）
  const shuffled = [...activeEntries].sort(() => Math.random() - 0.5)

  // ラウンドロビンで均等に配分
  shuffled.forEach((entry, index) => {
    const tableIndex = index % tableCount
    assignments[tableIndex].entries.push({
      ...entry,
      tableId: availableTables[tableIndex].id,
      seatNumber: assignments[tableIndex].entries.length + 1,
    })
  })

  return assignments
}

/**
 * 必要なテーブル数を計算する
 */
export function calculateRequiredTables(
  playerCount: number,
  maxPlayersPerTable: number = 9,
): number {
  if (playerCount <= 0) return 0
  return Math.ceil(playerCount / maxPlayersPerTable)
}

/**
 * テーブルごとの人数差が許容範囲内かチェック
 * （最大差1が理想）
 */
export function isBalanced(assignments: TableAssignment[]): boolean {
  if (assignments.length <= 1) return true
  const counts = assignments.map(a => a.entries.length)
  const max = Math.max(...counts)
  const min = Math.min(...counts)
  return max - min <= 1
}

/**
 * テーブルブレイクが必要かチェック
 * 人数差が2以上、またはテーブル数を減らせる場合にtrue
 */
export function needsTableBreak(
  assignments: TableAssignment[],
  maxPlayersPerTable: number = 9,
): boolean {
  if (assignments.length <= 1) return false
  const totalPlayers = assignments.reduce((sum, a) => sum + a.entries.length, 0)
  const neededTables = calculateRequiredTables(totalPlayers, maxPlayersPerTable)
  // テーブル数を減らせる場合、またはバランスが大きく崩れた場合
  return neededTables < assignments.length || !isBalanced(assignments)
}

/**
 * テーブルブレイクを実行
 * 最少人数テーブルを解散し、他テーブルに均等に分配する
 */
export function breakTable(
  assignments: TableAssignment[],
  maxPlayersPerTable: number = 9,
): TableAssignment[] {
  if (assignments.length <= 1) return assignments

  const totalPlayers = assignments.reduce((sum, a) => sum + a.entries.length, 0)
  const neededTables = calculateRequiredTables(totalPlayers, maxPlayersPerTable)

  if (neededTables >= assignments.length) {
    // テーブル数は減らせないが、バランスを整える
    return rebalanceTables(assignments)
  }

  // 最少人数テーブルを特定して解散
  const sorted = [...assignments].sort((a, b) => a.entries.length - b.entries.length)
  const tablesToBreak = sorted.slice(0, assignments.length - neededTables)
  const tablesToKeep = sorted.slice(assignments.length - neededTables)

  // 解散テーブルのプレイヤーを集める
  const playersToRedistribute = tablesToBreak.flatMap(a => a.entries)

  // 残りテーブルに均等に分配
  const result = tablesToKeep.map(a => ({ ...a, entries: [...a.entries] }))
  playersToRedistribute.forEach((player) => {
    // 最少人数テーブルに追加（均等化）
    const targetTable = result.reduce((min, t) =>
      t.entries.length < min.entries.length ? t : min
    , result[0])
    targetTable.entries.push({
      ...player,
      tableId: targetTable.tableId,
      seatNumber: targetTable.entries.length + 1,
    })
  })

  // シート番号を再割当
  return result.map(a => ({
    ...a,
    entries: a.entries.map((e, i) => ({ ...e, seatNumber: i + 1 })),
  }))
}

/**
 * テーブル間の人数バランスを整える（テーブル数は変えない）
 */
export function rebalanceTables(assignments: TableAssignment[]): TableAssignment[] {
  if (assignments.length <= 1) return assignments

  // 全プレイヤーを集めて再分配
  const allPlayers = assignments.flatMap(a => a.entries)
  const result: TableAssignment[] = assignments.map(a => ({
    tableId: a.tableId,
    tableName: a.tableName,
    entries: [],
  }))

  // ラウンドロビンで均等に配分
  allPlayers.forEach((player, index) => {
    const tableIndex = index % result.length
    result[tableIndex].entries.push({
      ...player,
      tableId: result[tableIndex].tableId,
      seatNumber: result[tableIndex].entries.length + 1,
    })
  })

  return result
}

/**
 * プレイヤーを別テーブルに移動する
 */
export function movePlayer(
  assignments: TableAssignment[],
  playerId: string,
  targetTableId: string,
  maxPlayersPerTable: number = 9,
): { assignments: TableAssignment[]; error?: string } {
  const targetTable = assignments.find(a => a.tableId === targetTableId)
  if (!targetTable) return { assignments, error: '移動先テーブルが見つかりません' }

  if (targetTable.entries.length >= maxPlayersPerTable) {
    return { assignments, error: `${targetTable.tableName}は定員（${maxPlayersPerTable}人）に達しています` }
  }

  // プレイヤーを元テーブルから削除
  let movedPlayer: TournamentEntry | null = null
  const newAssignments = assignments.map(a => {
    const playerIndex = a.entries.findIndex(e => e.id === playerId)
    if (playerIndex >= 0) {
      movedPlayer = a.entries[playerIndex]
      return {
        ...a,
        entries: a.entries
          .filter(e => e.id !== playerId)
          .map((e, i) => ({ ...e, seatNumber: i + 1 })),
      }
    }
    return a
  })

  if (!movedPlayer) return { assignments, error: 'プレイヤーが見つかりません' }

  // 移動先テーブルに追加
  return {
    assignments: newAssignments.map(a => {
      if (a.tableId === targetTableId) {
        const newEntries = [
          ...a.entries,
          { ...movedPlayer!, tableId: targetTableId, seatNumber: a.entries.length + 1 },
        ]
        return { ...a, entries: newEntries }
      }
      return a
    }),
  }
}
