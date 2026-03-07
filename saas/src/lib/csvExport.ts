import type { ChipTransaction, ChipDenomination, Tournament } from '../types'

export function exportTransactionsCSV(
  transactions: ChipTransaction[],
  denominations: ChipDenomination[]
): void {
  const headers = ['日時', '種別', 'テーブル', '現金額', 'チップ内訳', 'スタッフ', '備考']

  const typeLabels: Record<string, string> = {
    purchase: 'チップ購入',
    return: 'チップ返却',
    fill: 'フロート補充',
    collect: 'チップ回収',
  }

  const rows = transactions.map(tx => {
    const chipDetail = tx.chips
      .map(c => {
        const denom = denominations.find(d => d.id === c.denominationId)
        return denom ? `${denom.label}×${c.count}` : `?×${c.count}`
      })
      .join(' / ')

    return [
      new Date(tx.createdAt).toLocaleString('ja-JP'),
      typeLabels[tx.type] || tx.type,
      tx.tableId || '-',
      tx.cashAmount != null ? `¥${tx.cashAmount.toLocaleString()}` : '-',
      chipDetail,
      tx.staffName || '-',
      tx.note || '',
    ]
  })

  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `casinohub_transactions_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// CSV文字列からBlobを生成してダウンロードするヘルパー
function downloadCSV(csvContent: string, filename: string): void {
  const bom = '\uFEFF'
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function toCsvRow(cells: string[]): string {
  return cells.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
}

/**
 * トーナメント結果CSV
 * 順位・プレイヤー名・リバイ数・アドオン数・賞金額
 */
export function exportTournamentResultCSV(tournament: Tournament): void {
  const headers = ['順位', 'プレイヤー名', 'リバイ', 'アドオン', '賞金額']

  // 順位で並べ替え（finishPositionがあるものが先、その後に未確定）
  const sortedEntries = [...tournament.entries].sort((a, b) => {
    if (a.finishPosition != null && b.finishPosition != null) {
      return a.finishPosition - b.finishPosition
    }
    if (a.finishPosition != null) return -1
    if (b.finishPosition != null) return 1
    return 0
  })

  const rows = sortedEntries.map(e => [
    e.finishPosition != null ? String(e.finishPosition) : '-',
    e.playerName,
    String(e.rebuys),
    String(e.addons),
    e.prizeAmount != null ? `¥${e.prizeAmount.toLocaleString()}` : '-',
  ])

  const csvContent = [toCsvRow(headers), ...rows.map(toCsvRow)].join('\n')
  const safeName = tournament.name.replace(/[/\\?%*:|"<>]/g, '_')
  downloadCSV(csvContent, `casinohub_${safeName}_${tournament.date}.csv`)
}

/**
 * トーナメント集計CSV（日次/月次）
 */
export function exportTournamentSummaryCSV(
  tournaments: Tournament[],
  startDate?: string,
  endDate?: string,
): void {
  // 期間フィルタ
  let filtered = tournaments
  if (startDate) {
    filtered = filtered.filter(t => t.date >= startDate)
  }
  if (endDate) {
    filtered = filtered.filter(t => t.date <= endDate)
  }

  // 日次集計
  const dailyMap = new Map<string, {
    date: string
    tournamentCount: number
    totalEntries: number
    totalRebuys: number
    totalAddons: number
    totalRevenue: number
  }>()

  for (const t of filtered) {
    const existing = dailyMap.get(t.date)
    const rebuys = t.entries.reduce((sum, e) => sum + e.rebuys, 0)
    const addons = t.entries.reduce((sum, e) => sum + e.addons, 0)
    const revenue = t.entries.length * t.entryFee + rebuys * t.rebuyFee + addons * t.addonFee

    if (existing) {
      existing.tournamentCount += 1
      existing.totalEntries += t.entries.length
      existing.totalRebuys += rebuys
      existing.totalAddons += addons
      existing.totalRevenue += revenue
    } else {
      dailyMap.set(t.date, {
        date: t.date,
        tournamentCount: 1,
        totalEntries: t.entries.length,
        totalRebuys: rebuys,
        totalAddons: addons,
        totalRevenue: revenue,
      })
    }
  }

  const dailyData = [...dailyMap.values()].sort((a, b) => b.date.localeCompare(a.date))

  const headers = ['日付', 'トーナメント数', '参加者数', 'リバイ数', 'アドオン数', '売上概算']
  const rows = dailyData.map(d => [
    d.date,
    String(d.tournamentCount),
    String(d.totalEntries),
    String(d.totalRebuys),
    String(d.totalAddons),
    `¥${d.totalRevenue.toLocaleString()}`,
  ])

  // 合計行
  const totals = dailyData.reduce(
    (acc, d) => ({
      tournaments: acc.tournaments + d.tournamentCount,
      entries: acc.entries + d.totalEntries,
      rebuys: acc.rebuys + d.totalRebuys,
      addons: acc.addons + d.totalAddons,
      revenue: acc.revenue + d.totalRevenue,
    }),
    { tournaments: 0, entries: 0, rebuys: 0, addons: 0, revenue: 0 }
  )
  rows.push([
    '合計',
    String(totals.tournaments),
    String(totals.entries),
    String(totals.rebuys),
    String(totals.addons),
    `¥${totals.revenue.toLocaleString()}`,
  ])

  const csvContent = [toCsvRow(headers), ...rows.map(toCsvRow)].join('\n')
  const dateRange = startDate && endDate ? `${startDate}_${endDate}` : new Date().toISOString().split('T')[0]
  downloadCSV(csvContent, `casinohub_tournament_summary_${dateRange}.csv`)
}
