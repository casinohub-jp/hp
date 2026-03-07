import type { Tournament } from '../types'

export interface TournamentBilling {
  tournamentId: string
  tournamentName: string
  date: string
  entryCount: number       // エントリー数
  rebuyCount: number       // リバイ数
  totalParticipants: number // エントリー + リバイ（課金対象）
  unitPrice: number        // 単価
  amount: number           // 請求額
}

export interface DailyBillingSummary {
  date: string
  tournamentCount: number
  totalParticipants: number
  totalAmount: number
  tournaments: TournamentBilling[]
}

export interface MonthlyBillingSummary {
  month: string           // YYYY-MM
  tournamentCount: number
  totalParticipants: number
  totalAmount: number
  dailySummaries: DailyBillingSummary[]
}

/**
 * トーナメント単位の課金額を計算
 * リバイも参加者としてカウントする
 */
export function calculateTournamentBilling(
  tournament: Tournament,
  unitPrice: number = 50,
): TournamentBilling {
  const entryCount = tournament.entries.length
  const rebuyCount = tournament.entries.reduce((sum, e) => sum + e.rebuys, 0)
  const totalParticipants = entryCount + rebuyCount

  return {
    tournamentId: tournament.id,
    tournamentName: tournament.name,
    date: tournament.date,
    entryCount,
    rebuyCount,
    totalParticipants,
    unitPrice,
    amount: totalParticipants * unitPrice,
  }
}

/**
 * 日次の課金サマリーを生成
 */
export function generateDailyBillingSummaries(
  tournaments: Tournament[],
  unitPrice: number = 50,
): DailyBillingSummary[] {
  const finished = tournaments.filter(t => t.status === 'finished')

  const dailyMap = new Map<string, TournamentBilling[]>()

  for (const t of finished) {
    const billing = calculateTournamentBilling(t, unitPrice)
    const existing = dailyMap.get(billing.date) || []
    existing.push(billing)
    dailyMap.set(billing.date, existing)
  }

  const summaries: DailyBillingSummary[] = []
  for (const [date, tournamentsForDay] of dailyMap) {
    summaries.push({
      date,
      tournamentCount: tournamentsForDay.length,
      totalParticipants: tournamentsForDay.reduce((s, t) => s + t.totalParticipants, 0),
      totalAmount: tournamentsForDay.reduce((s, t) => s + t.amount, 0),
      tournaments: tournamentsForDay,
    })
  }

  return summaries.sort((a, b) => b.date.localeCompare(a.date))
}

/**
 * 月次の課金サマリーを生成
 */
export function generateMonthlyBillingSummary(
  tournaments: Tournament[],
  unitPrice: number = 50,
): MonthlyBillingSummary[] {
  const dailySummaries = generateDailyBillingSummaries(tournaments, unitPrice)

  const monthlyMap = new Map<string, DailyBillingSummary[]>()

  for (const daily of dailySummaries) {
    const month = daily.date.slice(0, 7)
    const existing = monthlyMap.get(month) || []
    existing.push(daily)
    monthlyMap.set(month, existing)
  }

  const summaries: MonthlyBillingSummary[] = []
  for (const [month, days] of monthlyMap) {
    summaries.push({
      month,
      tournamentCount: days.reduce((s, d) => s + d.tournamentCount, 0),
      totalParticipants: days.reduce((s, d) => s + d.totalParticipants, 0),
      totalAmount: days.reduce((s, d) => s + d.totalAmount, 0),
      dailySummaries: days,
    })
  }

  return summaries.sort((a, b) => b.month.localeCompare(a.month))
}

/**
 * 課金サマリーCSV出力
 */
export function exportBillingCSV(
  monthlySummaries: MonthlyBillingSummary[],
): void {
  const headers = ['月', 'トーナメント数', '参加者数（リバイ含む）', '単価', '請求額（税込）']
  const rows = monthlySummaries.map(m => [
    m.month,
    String(m.tournamentCount),
    String(m.totalParticipants),
    `¥${m.totalAmount > 0 ? Math.round(m.totalAmount / m.totalParticipants).toLocaleString() : '0'}`,
    `¥${m.totalAmount.toLocaleString()}`,
  ])

  // 合計行
  const total = monthlySummaries.reduce(
    (acc, m) => ({
      tournaments: acc.tournaments + m.tournamentCount,
      participants: acc.participants + m.totalParticipants,
      amount: acc.amount + m.totalAmount,
    }),
    { tournaments: 0, participants: 0, amount: 0 },
  )
  rows.push([
    '合計',
    String(total.tournaments),
    String(total.participants),
    '-',
    `¥${total.amount.toLocaleString()}`,
  ])

  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  const bom = '\uFEFF'
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `casinohub_billing_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
