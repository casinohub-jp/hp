import { useState, useMemo } from 'react'
import { useApp } from '../contexts/AppContext'

type Period = 'daily' | 'monthly'

export default function ReportTab() {
  const { state } = useApp()
  const [period, setPeriod] = useState<Period>('daily')

  // 日次: 取引データから日ごとの売上を集計
  const dailyReport = useMemo(() => {
    const byDate: Record<string, { chipSales: number; count: number }> = {}

    for (const tx of state.transactions) {
      if (tx.type !== 'purchase') continue
      const date = tx.createdAt.split('T')[0]
      if (!byDate[date]) byDate[date] = { chipSales: 0, count: 0 }
      byDate[date].chipSales += tx.cashAmount || 0
      byDate[date].count += 1
    }

    // dailySales のドリンク等も合算
    const result: {
      date: string
      chipSales: number
      drinkSales: number
      tournamentSales: number
      otherSales: number
      totalSales: number
      txCount: number
    }[] = []

    const allDates = new Set([
      ...Object.keys(byDate),
      ...state.dailySales.map(s => s.date),
    ])

    for (const date of [...allDates].sort().reverse()) {
      const txData = byDate[date] || { chipSales: 0, count: 0 }
      const salesData = state.dailySales.find(s => s.date === date)

      const chipSales = txData.chipSales || salesData?.chipSales || 0
      const drinkSales = salesData?.drinkSales || 0
      const tournamentSales = salesData?.tournamentSales || 0
      const otherSales = salesData?.otherSales || 0

      result.push({
        date,
        chipSales,
        drinkSales,
        tournamentSales,
        otherSales,
        totalSales: chipSales + drinkSales + tournamentSales + otherSales,
        txCount: txData.count,
      })
    }

    return result
  }, [state.transactions, state.dailySales])

  // 月次: 日次を月ごとに集約
  const monthlyReport = useMemo(() => {
    const byMonth: Record<string, {
      chipSales: number
      drinkSales: number
      tournamentSales: number
      otherSales: number
      totalSales: number
      days: number
    }> = {}

    for (const day of dailyReport) {
      const month = day.date.slice(0, 7) // YYYY-MM
      if (!byMonth[month]) {
        byMonth[month] = { chipSales: 0, drinkSales: 0, tournamentSales: 0, otherSales: 0, totalSales: 0, days: 0 }
      }
      byMonth[month].chipSales += day.chipSales
      byMonth[month].drinkSales += day.drinkSales
      byMonth[month].tournamentSales += day.tournamentSales
      byMonth[month].otherSales += day.otherSales
      byMonth[month].totalSales += day.totalSales
      byMonth[month].days += 1
    }

    return Object.entries(byMonth)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, data]) => ({ month, ...data }))
  }, [dailyReport])

  return (
    <div className="space-y-4">
      {/* 期間切り替え */}
      <div className="flex gap-2">
        <button
          onClick={() => setPeriod('daily')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            period === 'daily' ? 'bg-[#2d8a4e] text-white' : 'bg-[#121a2e] text-[#8090b0] border border-[#2a3050]'
          }`}
        >
          日次
        </button>
        <button
          onClick={() => setPeriod('monthly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            period === 'monthly' ? 'bg-[#2d8a4e] text-white' : 'bg-[#121a2e] text-[#8090b0] border border-[#2a3050]'
          }`}
        >
          月次
        </button>
      </div>

      {period === 'daily' ? (
        // 日次レポート
        <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a3050] text-[#8090b0] text-xs">
                <th className="text-left px-4 py-3">日付</th>
                <th className="text-right px-4 py-3">チップ売上</th>
                <th className="text-right px-4 py-3">ドリンク</th>
                <th className="text-right px-4 py-3">トーナメント</th>
                <th className="text-right px-4 py-3 font-bold text-[#c9a456]">合計</th>
                <th className="text-right px-4 py-3">取引数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3050]">
              {dailyReport.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#8090b0]">
                    データがありません
                  </td>
                </tr>
              ) : (
                dailyReport.map(day => (
                  <tr key={day.date} className="hover:bg-[#1a2040]/50">
                    <td className="px-4 py-3 font-medium">{day.date}</td>
                    <td className="px-4 py-3 text-right">¥{day.chipSales.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">¥{day.drinkSales.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">¥{day.tournamentSales.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#c9a456]">¥{day.totalSales.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-[#8090b0]">{day.txCount}件</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // 月次レポート
        <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a3050] text-[#8090b0] text-xs">
                <th className="text-left px-4 py-3">月</th>
                <th className="text-right px-4 py-3">チップ売上</th>
                <th className="text-right px-4 py-3">ドリンク</th>
                <th className="text-right px-4 py-3">トーナメント</th>
                <th className="text-right px-4 py-3 font-bold text-[#c9a456]">合計</th>
                <th className="text-right px-4 py-3">営業日数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3050]">
              {monthlyReport.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#8090b0]">
                    データがありません
                  </td>
                </tr>
              ) : (
                monthlyReport.map(month => (
                  <tr key={month.month} className="hover:bg-[#1a2040]/50">
                    <td className="px-4 py-3 font-medium">{month.month}</td>
                    <td className="px-4 py-3 text-right">¥{month.chipSales.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">¥{month.drinkSales.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">¥{month.tournamentSales.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#c9a456]">¥{month.totalSales.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-[#8090b0]">{month.days}日</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
