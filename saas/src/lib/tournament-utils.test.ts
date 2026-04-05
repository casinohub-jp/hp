import { describe, it, expect } from 'vitest'
import { calculatePrizePool, distributePrizes } from './tournament-utils'
import type { TournamentEntry, PrizeLevel } from '../types'

// --- calculatePrizePool ---
describe('calculatePrizePool', () => {
  it('エントリーのみ', () => {
    expect(calculatePrizePool(10, 3000, 0, 2000, 0, 1000)).toBe(30000)
  })

  it('リバイ込み', () => {
    expect(calculatePrizePool(10, 3000, 5, 2000, 0, 1000)).toBe(40000)
  })

  it('全要素込み', () => {
    // 10 * 3000 + 5 * 2000 + 3 * 1000 = 30000 + 10000 + 3000 = 43000
    expect(calculatePrizePool(10, 3000, 5, 2000, 3, 1000)).toBe(43000)
  })

  it('参加者0人', () => {
    expect(calculatePrizePool(0, 3000, 0, 2000, 0, 1000)).toBe(0)
  })

  it('フィー0円', () => {
    expect(calculatePrizePool(10, 0, 5, 0, 3, 0)).toBe(0)
  })
})

// --- distributePrizes ---
describe('distributePrizes', () => {
  const defaultStructure: PrizeLevel[] = [
    { position: 1, percentage: 50, label: '1位' },
    { position: 2, percentage: 30, label: '2位' },
    { position: 3, percentage: 20, label: '3位' },
  ]

  function makeEntry(overrides: Partial<TournamentEntry> = {}): TournamentEntry {
    return {
      id: 'e1',
      playerName: 'Player',
      rebuys: 0,
      addons: 0,
      enteredAt: '2026-01-01T00:00:00Z',
      ...overrides,
    }
  }

  it('基本配分（3人）', () => {
    const entries = [
      makeEntry({ id: 'e1', finishPosition: 1 }),
      makeEntry({ id: 'e2', finishPosition: 2 }),
      makeEntry({ id: 'e3', finishPosition: 3 }),
    ]
    const result = distributePrizes(entries, 10000, defaultStructure)

    expect(result[0].prizeAmount).toBe(5000)
    expect(result[1].prizeAmount).toBe(3000)
    expect(result[2].prizeAmount).toBe(2000)
  })

  it('端数切り捨て', () => {
    const entries = [
      makeEntry({ id: 'e1', finishPosition: 1 }),
      makeEntry({ id: 'e2', finishPosition: 2 }),
      makeEntry({ id: 'e3', finishPosition: 3 }),
    ]
    // 10001 * 50% = 5000.5 → 5000
    const result = distributePrizes(entries, 10001, defaultStructure)

    expect(result[0].prizeAmount).toBe(5000)
    expect(result[1].prizeAmount).toBe(3000)
    expect(result[2].prizeAmount).toBe(2000)
  })

  it('finishPositionがない参加者はスキップ', () => {
    const entries = [
      makeEntry({ id: 'e1', finishPosition: 1 }),
      makeEntry({ id: 'e2' }), // 未確定
    ]
    const result = distributePrizes(entries, 10000, defaultStructure)

    expect(result[0].prizeAmount).toBe(5000)
    expect(result[1].prizeAmount).toBeUndefined()
  })

  it('prizeStructureに該当順位がない場合はスキップ', () => {
    const entries = [
      makeEntry({ id: 'e1', finishPosition: 4 }), // 4位の配分はない
    ]
    const result = distributePrizes(entries, 10000, defaultStructure)

    expect(result[0].prizeAmount).toBeUndefined()
  })

  it('賞金プール0円', () => {
    const entries = [
      makeEntry({ id: 'e1', finishPosition: 1 }),
    ]
    const result = distributePrizes(entries, 0, defaultStructure)

    expect(result[0].prizeAmount).toBe(0)
  })

  it('空のエントリー', () => {
    const result = distributePrizes([], 10000, defaultStructure)
    expect(result).toEqual([])
  })

  it('空のprizeStructure', () => {
    const entries = [
      makeEntry({ id: 'e1', finishPosition: 1 }),
    ]
    const result = distributePrizes(entries, 10000, [])

    expect(result[0].prizeAmount).toBeUndefined()
  })

  it('既存のprizeAmountは上書きされる', () => {
    const entries = [
      makeEntry({ id: 'e1', finishPosition: 1, prizeAmount: 999 }),
    ]
    const result = distributePrizes(entries, 10000, defaultStructure)

    expect(result[0].prizeAmount).toBe(5000)
  })
})
