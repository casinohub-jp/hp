import type { ChipTransaction, ChipDenomination } from '../types'

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
