import { describe, it, expect } from 'vitest'
import {
  assignPlayersToTables, calculateRequiredTables, isBalanced,
  needsTableBreak, breakTable, rebalanceTables, movePlayer,
  type TableAssignment,
} from './table-assignment'
import type { TournamentEntry, Table } from '../types'

function makeEntry(id: string, name: string, eliminated = false): TournamentEntry {
  return {
    id,
    playerName: name,
    rebuys: 0,
    addons: 0,
    enteredAt: new Date().toISOString(),
    eliminatedAt: eliminated ? new Date().toISOString() : undefined,
  }
}

function makeTable(id: string, name: string): Table {
  return { id, name, gameType: 'holdem', isOpen: true }
}

describe('calculateRequiredTables', () => {
  it('0人なら0テーブル', () => {
    expect(calculateRequiredTables(0)).toBe(0)
  })

  it('9人以下なら1テーブル', () => {
    expect(calculateRequiredTables(1)).toBe(1)
    expect(calculateRequiredTables(9)).toBe(1)
  })

  it('10人なら2テーブル', () => {
    expect(calculateRequiredTables(10)).toBe(2)
  })

  it('18人なら2テーブル', () => {
    expect(calculateRequiredTables(18)).toBe(2)
  })

  it('19人なら3テーブル', () => {
    expect(calculateRequiredTables(19)).toBe(3)
  })

  it('カスタムmax', () => {
    expect(calculateRequiredTables(10, 5)).toBe(2)
    expect(calculateRequiredTables(11, 5)).toBe(3)
  })
})

describe('assignPlayersToTables', () => {
  const tables = [
    makeTable('t1', 'テーブル1'),
    makeTable('t2', 'テーブル2'),
    makeTable('t3', 'テーブル3'),
    makeTable('t4', 'テーブル4'),
  ]

  it('空のエントリーなら空配列', () => {
    expect(assignPlayersToTables([], tables)).toEqual([])
  })

  it('テーブルがなければ空配列', () => {
    const entries = [makeEntry('e1', 'Player1')]
    expect(assignPlayersToTables(entries, [])).toEqual([])
  })

  it('3人・1テーブル上限9の場合、1テーブルに割り当て', () => {
    const entries = Array.from({ length: 3 }, (_, i) => makeEntry(`e${i}`, `Player${i}`))
    const result = assignPlayersToTables(entries, tables, 9)
    expect(result.length).toBe(1)
    expect(result[0].entries.length).toBe(3)
  })

  it('10人を2テーブルに均等配分（5-5）', () => {
    const entries = Array.from({ length: 10 }, (_, i) => makeEntry(`e${i}`, `Player${i}`))
    const result = assignPlayersToTables(entries, tables, 9)
    expect(result.length).toBe(2)
    expect(isBalanced(result)).toBe(true)
    const counts = result.map(r => r.entries.length).sort()
    expect(counts).toEqual([5, 5])
  })

  it('11人を2テーブルに配分（5-6 or 6-5）', () => {
    const entries = Array.from({ length: 11 }, (_, i) => makeEntry(`e${i}`, `Player${i}`))
    const result = assignPlayersToTables(entries, tables, 9)
    expect(result.length).toBe(2)
    expect(isBalanced(result)).toBe(true)
    const counts = result.map(r => r.entries.length).sort()
    expect(counts).toEqual([5, 6])
  })

  it('脱落済みプレイヤーは割り当てられない', () => {
    const entries = [
      makeEntry('e1', 'Active1'),
      makeEntry('e2', 'Active2'),
      makeEntry('e3', 'Eliminated', true),
    ]
    const result = assignPlayersToTables(entries, tables, 9)
    expect(result.length).toBe(1)
    expect(result[0].entries.length).toBe(2)
  })

  it('全エントリーにtableIdとseatNumberが設定される', () => {
    const entries = Array.from({ length: 5 }, (_, i) => makeEntry(`e${i}`, `Player${i}`))
    const result = assignPlayersToTables(entries, tables, 9)
    for (const assignment of result) {
      for (const entry of assignment.entries) {
        expect(entry.tableId).toBe(assignment.tableId)
        expect(entry.seatNumber).toBeGreaterThan(0)
      }
    }
  })

  it('20人を3テーブルに配分（6-7-7 or similar）', () => {
    const entries = Array.from({ length: 20 }, (_, i) => makeEntry(`e${i}`, `Player${i}`))
    const result = assignPlayersToTables(entries, tables, 9)
    expect(result.length).toBe(3)
    expect(isBalanced(result)).toBe(true)
    const total = result.reduce((sum, r) => sum + r.entries.length, 0)
    expect(total).toBe(20)
  })
})

describe('isBalanced', () => {
  it('空配列はbalanced', () => {
    expect(isBalanced([])).toBe(true)
  })

  it('1テーブルはbalanced', () => {
    expect(isBalanced([{ tableId: 't1', tableName: 'T1', entries: [] }])).toBe(true)
  })

  it('差1はbalanced', () => {
    const assignments = [
      { tableId: 't1', tableName: 'T1', entries: new Array(5).fill(null) as TournamentEntry[] },
      { tableId: 't2', tableName: 'T2', entries: new Array(6).fill(null) as TournamentEntry[] },
    ]
    expect(isBalanced(assignments)).toBe(true)
  })

  it('差2はunbalanced', () => {
    const assignments = [
      { tableId: 't1', tableName: 'T1', entries: new Array(4).fill(null) as TournamentEntry[] },
      { tableId: 't2', tableName: 'T2', entries: new Array(6).fill(null) as TournamentEntry[] },
    ]
    expect(isBalanced(assignments)).toBe(false)
  })
})

describe('needsTableBreak', () => {
  it('1テーブル以下はfalse', () => {
    expect(needsTableBreak([])).toBe(false)
    expect(needsTableBreak([{ tableId: 't1', tableName: 'T1', entries: [] }])).toBe(false)
  })

  it('テーブル数を減らせる場合はtrue', () => {
    // 5人なのに2テーブルある -> 1テーブルに減らせる
    const entries = Array.from({ length: 5 }, (_, i) => makeEntry(`e${i}`, `Player${i}`))
    const assignments: TableAssignment[] = [
      { tableId: 't1', tableName: 'T1', entries: entries.slice(0, 2) },
      { tableId: 't2', tableName: 'T2', entries: entries.slice(2) },
    ]
    expect(needsTableBreak(assignments, 9)).toBe(true)
  })

  it('バランスが崩れている場合はtrue', () => {
    const entries = Array.from({ length: 10 }, (_, i) => makeEntry(`e${i}`, `Player${i}`))
    const assignments: TableAssignment[] = [
      { tableId: 't1', tableName: 'T1', entries: entries.slice(0, 3) },
      { tableId: 't2', tableName: 'T2', entries: entries.slice(3) },
    ]
    expect(needsTableBreak(assignments, 9)).toBe(true)
  })
})

describe('breakTable', () => {
  it('1テーブルならそのまま返す', () => {
    const entries = Array.from({ length: 3 }, (_, i) => makeEntry(`e${i}`, `Player${i}`))
    const assignments: TableAssignment[] = [
      { tableId: 't1', tableName: 'T1', entries },
    ]
    const result = breakTable(assignments, 9)
    expect(result.length).toBe(1)
  })

  it('テーブル数を減らせる場合、最少テーブルを解散', () => {
    const entries = Array.from({ length: 7 }, (_, i) => makeEntry(`e${i}`, `Player${i}`))
    const assignments: TableAssignment[] = [
      { tableId: 't1', tableName: 'T1', entries: entries.slice(0, 2) },
      { tableId: 't2', tableName: 'T2', entries: entries.slice(2) },
    ]
    const result = breakTable(assignments, 9)
    expect(result.length).toBe(1)
    const total = result.reduce((sum, r) => sum + r.entries.length, 0)
    expect(total).toBe(7)
  })

  it('テーブル数は同じだがバランス調整される', () => {
    const entries = Array.from({ length: 16 }, (_, i) => makeEntry(`e${i}`, `Player${i}`))
    const assignments: TableAssignment[] = [
      { tableId: 't1', tableName: 'T1', entries: entries.slice(0, 4) },
      { tableId: 't2', tableName: 'T2', entries: entries.slice(4) },
    ]
    const result = breakTable(assignments, 9)
    expect(result.length).toBe(2)
    expect(isBalanced(result)).toBe(true)
  })
})

describe('rebalanceTables', () => {
  it('均等に再配分', () => {
    const entries = Array.from({ length: 10 }, (_, i) => makeEntry(`e${i}`, `Player${i}`))
    const assignments: TableAssignment[] = [
      { tableId: 't1', tableName: 'T1', entries: entries.slice(0, 3) },
      { tableId: 't2', tableName: 'T2', entries: entries.slice(3) },
    ]
    const result = rebalanceTables(assignments)
    expect(isBalanced(result)).toBe(true)
  })
})

describe('movePlayer', () => {
  it('プレイヤーを別テーブルに移動', () => {
    const entries = Array.from({ length: 6 }, (_, i) => makeEntry(`e${i}`, `Player${i}`))
    const assignments: TableAssignment[] = [
      { tableId: 't1', tableName: 'T1', entries: entries.slice(0, 3).map((e, i) => ({ ...e, tableId: 't1', seatNumber: i + 1 })) },
      { tableId: 't2', tableName: 'T2', entries: entries.slice(3).map((e, i) => ({ ...e, tableId: 't2', seatNumber: i + 1 })) },
    ]
    const result = movePlayer(assignments, 'e0', 't2', 9)
    expect(result.error).toBeUndefined()
    const t1 = result.assignments.find(a => a.tableId === 't1')!
    const t2 = result.assignments.find(a => a.tableId === 't2')!
    expect(t1.entries.length).toBe(2)
    expect(t2.entries.length).toBe(4)
    expect(t2.entries.some(e => e.id === 'e0')).toBe(true)
  })

  it('定員超過時はエラー', () => {
    const entries = Array.from({ length: 4 }, (_, i) => makeEntry(`e${i}`, `Player${i}`))
    const assignments: TableAssignment[] = [
      { tableId: 't1', tableName: 'T1', entries: [{ ...entries[0], tableId: 't1', seatNumber: 1 }] },
      { tableId: 't2', tableName: 'T2', entries: entries.slice(1).map((e, i) => ({ ...e, tableId: 't2', seatNumber: i + 1 })) },
    ]
    const result = movePlayer(assignments, 'e0', 't2', 3)
    expect(result.error).toBeDefined()
  })

  it('存在しないプレイヤーはエラー', () => {
    const assignments: TableAssignment[] = [
      { tableId: 't1', tableName: 'T1', entries: [] },
    ]
    const result = movePlayer(assignments, 'nonexistent', 't1', 9)
    expect(result.error).toBeDefined()
  })
})
