import type { TournamentEntry, PrizeLevel } from '../types'

// 賞金プール計算
export function calculatePrizePool(
  entryCount: number,
  entryFee: number,
  totalRebuys: number,
  rebuyFee: number,
  totalAddons: number,
  addonFee: number,
): number {
  return entryCount * entryFee + totalRebuys * rebuyFee + totalAddons * addonFee
}

// 賞金配分
export function distributePrizes(
  entries: TournamentEntry[],
  prizePool: number,
  prizeStructure: PrizeLevel[],
): TournamentEntry[] {
  return entries.map(e => {
    if (e.finishPosition == null) return e
    const prize = prizeStructure.find(p => p.position === e.finishPosition)
    if (!prize) return e
    return { ...e, prizeAmount: Math.floor(prizePool * prize.percentage / 100) }
  })
}
