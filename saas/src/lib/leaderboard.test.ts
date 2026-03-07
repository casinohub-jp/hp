import { describe, it, expect } from 'vitest'
import { getPointsForPosition, aggregateLeaderboard } from './leaderboard'
import type { Tournament } from '../types'

function makeTournament(
  overrides: Partial<Tournament> & { entries: Tournament['entries'] }
): Tournament {
  return {
    id: 't1',
    name: 'テスト大会',
    date: '2026-03-01',
    status: 'finished',
    entryFee: 3000,
    rebuyFee: 2000,
    addonFee: 1000,
    startingChips: 10000,
    maxPlayers: 50,
    blindStructure: [],
    currentLevel: 0,
    prizeStructure: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

function makeEntry(name: string, position?: number, prize?: number) {
  return {
    id: `e-${name}-${Math.random()}`,
    playerName: name,
    rebuys: 0,
    addons: 0,
    enteredAt: new Date().toISOString(),
    finishPosition: position,
    prizeAmount: prize,
  }
}

describe('getPointsForPosition', () => {
  it('1位は100pt', () => {
    expect(getPointsForPosition(1)).toBe(100)
  })

  it('2位は70pt', () => {
    expect(getPointsForPosition(2)).toBe(70)
  })

  it('3位は50pt', () => {
    expect(getPointsForPosition(3)).toBe(50)
  })

  it('10位以降は5pt', () => {
    expect(getPointsForPosition(10)).toBe(5)
    expect(getPointsForPosition(50)).toBe(5)
  })

  it('順位なし（参加のみ）は5pt', () => {
    expect(getPointsForPosition(undefined)).toBe(5)
  })
})

describe('aggregateLeaderboard', () => {
  it('空配列なら空配列を返す', () => {
    expect(aggregateLeaderboard([])).toEqual([])
  })

  it('finished以外のトーナメントは除外', () => {
    const t = makeTournament({
      status: 'running',
      entries: [makeEntry('Player1', 1, 10000)],
    })
    expect(aggregateLeaderboard([t])).toEqual([])
  })

  it('1大会の結果を正しく集計', () => {
    const t = makeTournament({
      entries: [
        makeEntry('Alice', 1, 10000),
        makeEntry('Bob', 2, 5000),
        makeEntry('Charlie', 3, 3000),
      ],
    })
    const result = aggregateLeaderboard([t])
    expect(result.length).toBe(3)
    expect(result[0].playerName).toBe('Alice')
    expect(result[0].totalPoints).toBe(100)
    expect(result[0].winCount).toBe(1)
    expect(result[0].totalPrize).toBe(10000)
    expect(result[1].playerName).toBe('Bob')
    expect(result[1].totalPoints).toBe(70)
    expect(result[2].playerName).toBe('Charlie')
    expect(result[2].totalPoints).toBe(50)
  })

  it('複数大会のポイントを合算', () => {
    const t1 = makeTournament({
      id: 't1',
      entries: [
        makeEntry('Alice', 1, 10000),
        makeEntry('Bob', 2, 5000),
      ],
    })
    const t2 = makeTournament({
      id: 't2',
      date: '2026-03-02',
      entries: [
        makeEntry('Bob', 1, 10000),
        makeEntry('Alice', 3, 3000),
      ],
    })
    const result = aggregateLeaderboard([t1, t2])
    // Alice: 100 + 50 = 150, Bob: 70 + 100 = 170
    expect(result[0].playerName).toBe('Bob')
    expect(result[0].totalPoints).toBe(170)
    expect(result[0].winCount).toBe(1)
    expect(result[0].tournamentCount).toBe(2)
    expect(result[1].playerName).toBe('Alice')
    expect(result[1].totalPoints).toBe(150)
  })

  it('日付フィルタが機能する', () => {
    const t1 = makeTournament({
      id: 't1',
      date: '2026-01-15',
      entries: [makeEntry('Alice', 1, 10000)],
    })
    const t2 = makeTournament({
      id: 't2',
      date: '2026-03-15',
      entries: [makeEntry('Alice', 1, 10000)],
    })
    const result = aggregateLeaderboard([t1, t2], { startDate: '2026-03-01' })
    expect(result.length).toBe(1)
    expect(result[0].tournamentCount).toBe(1)
  })

  it('検索フィルタが機能する', () => {
    const t = makeTournament({
      entries: [
        makeEntry('Alice', 1),
        makeEntry('Bob', 2),
        makeEntry('Alicia', 3),
      ],
    })
    const result = aggregateLeaderboard([t], { searchQuery: 'ali' })
    expect(result.length).toBe(2)
    expect(result.map(r => r.playerName).sort()).toEqual(['Alice', 'Alicia'])
  })

  it('bestFinishとavgFinishが正しい', () => {
    const t1 = makeTournament({
      id: 't1',
      entries: [makeEntry('Alice', 3)],
    })
    const t2 = makeTournament({
      id: 't2',
      date: '2026-03-02',
      entries: [makeEntry('Alice', 1)],
    })
    const result = aggregateLeaderboard([t1, t2])
    expect(result[0].bestFinish).toBe(1)
    expect(result[0].avgFinish).toBe(2) // (3+1)/2
  })

  it('topThreeCountが正しい', () => {
    const tournaments = [
      makeTournament({ id: 't1', date: '2026-03-01', entries: [makeEntry('Alice', 1)] }),
      makeTournament({ id: 't2', date: '2026-03-02', entries: [makeEntry('Alice', 2)] }),
      makeTournament({ id: 't3', date: '2026-03-03', entries: [makeEntry('Alice', 4)] }),
      makeTournament({ id: 't4', date: '2026-03-04', entries: [makeEntry('Alice', 3)] }),
    ]
    const result = aggregateLeaderboard(tournaments)
    expect(result[0].topThreeCount).toBe(3)
  })
})
