import { useState, useMemo } from 'react'
import { Download, Receipt } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { SkeletonTable } from '../components/LoadingAndEmpty'
import { exportTournamentSummaryCSV } from '../lib/csvExport'
import { generateMonthlyBillingSummary, exportBillingCSV } from '../lib/billing'

type Period = 'daily' | 'monthly'
type ReportView = 'sales' | 'billing'

// 課金単価のlocalStorage管理
const UNIT_PRICE_KEY = 'casinohub_billing_unit_price'
function getSavedUnitPrice(): number {
  const saved = localStorage.getItem(UNIT_PRICE_KEY)
  return saved ? Number(saved) : 50
}

export default function ReportTab() {
  const { state, loading } = useApp()
  const [period, setPeriod] = useState<Period>('daily')
  const [view, setView] = useState<ReportView>('sales')
  const [unitPrice, setUnitPrice] = useState(getSavedUnitPrice)

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

  // 課金サマリー
  const billingSummary = useMemo(() => {
    return generateMonthlyBillingSummary(state.tournaments, unitPrice)
  }, [state.tournaments, unitPrice])

  const handleUnitPriceChange = (price: number) => {
    setUnitPrice(price)
    localStorage.setItem(UNIT_PRICE_KEY, String(price))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="w-16 h-10 bg-[#2a3050] rounded-lg animate-pulse" />
          <div className="w-16 h-10 bg-[#2a3050] rounded-lg animate-pulse" />
        </div>
        <SkeletonTable rows={5} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ビュー切り替え */}
      <div className="flex items-center gap-3 border-b border-[#2a3050] pb-3">
        <button
          onClick={() => setView('sales')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'sales' ? 'bg-[#2d8a4e] text-white' : 'bg-[#121a2e] text-[#8090b0] border border-[#2a3050]'
          }`}
        >
          売上レポート
        </button>
        <button
          onClick={() => setView('billing')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'billing' ? 'bg-[#2d8a4e] text-white' : 'bg-[#121a2e] text-[#8090b0] border border-[#2a3050]'
          }`}
        >
          <Receipt size={14} /> 課金サマリー
        </button>
      </div>

      {view === 'sales' ? (
        <SalesView
          period={period}
          setPeriod={setPeriod}
          dailyReport={dailyReport}
          monthlyReport={monthlyReport}
          tournaments={state.tournaments}
        />
      ) : (
        <BillingView
          billingSummary={billingSummary}
          unitPrice={unitPrice}
          onUnitPriceChange={handleUnitPriceChange}
        />
      )}
    </div>
  )
}

// 売上レポートビュー
function SalesView({
  period,
  setPeriod,
  dailyReport,
  monthlyReport,
  tournaments,
}: {
  period: Period
  setPeriod: (p: Period) => void
  dailyReport: { date: string; chipSales: number; drinkSales: number; tournamentSales: number; otherSales: number; totalSales: number; txCount: number }[]
  monthlyReport: { month: string; chipSales: number; drinkSales: number; tournamentSales: number; otherSales: number; totalSales: number; days: number }[]
  tournaments: import('../types').Tournament[]
}) {
  return (
    <>
      {/* 期間切り替え + CSV */}
      <div className="flex items-center justify-between">
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
        {tournaments.length > 0 && (
          <button
            onClick={() => exportTournamentSummaryCSV(tournaments)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a3050] hover:bg-[#3a4060] rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} /> トーナメント集計CSV
          </button>
        )}
      </div>

      {period === 'daily' ? (
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
    </>
  )
}

// 課金サマリービュー
function BillingView({
  billingSummary,
  unitPrice,
  onUnitPriceChange,
}: {
  billingSummary: import('../lib/billing').MonthlyBillingSummary[]
  unitPrice: number
  onUnitPriceChange: (price: number) => void
}) {
  // 合計
  const totals = billingSummary.reduce(
    (acc, m) => ({
      tournaments: acc.tournaments + m.tournamentCount,
      participants: acc.participants + m.totalParticipants,
      amount: acc.amount + m.totalAmount,
    }),
    { tournaments: 0, participants: 0, amount: 0 },
  )

  return (
    <>
      {/* 単価設定 + CSV */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm text-[#8090b0]">参加者単価（税込）</label>
          <select
            value={unitPrice}
            onChange={e => onUnitPriceChange(Number(e.target.value))}
            className="px-3 py-1.5 bg-[#121a2e] border border-[#2a3050] rounded-lg text-sm text-white focus:outline-none focus:border-[#2d8a4e]"
          >
            <option value={30}>¥30</option>
            <option value={50}>¥50</option>
            <option value={80}>¥80</option>
            <option value={100}>¥100</option>
            <option value={150}>¥150</option>
            <option value={200}>¥200</option>
          </select>
        </div>
        {billingSummary.length > 0 && (
          <button
            onClick={() => exportBillingCSV(billingSummary)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a3050] hover:bg-[#3a4060] rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} /> 課金CSV
          </button>
        )}
      </div>

      {/* サマリーカード */}
      {totals.tournaments > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] p-4 text-center">
            <div className="text-2xl font-bold">{totals.tournaments}</div>
            <div className="text-xs text-[#8090b0] mt-1">トーナメント数</div>
          </div>
          <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] p-4 text-center">
            <div className="text-2xl font-bold">{totals.participants.toLocaleString()}</div>
            <div className="text-xs text-[#8090b0] mt-1">参加者数（リバイ含む）</div>
          </div>
          <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] p-4 text-center">
            <div className="text-2xl font-bold text-[#c9a456]">¥{totals.amount.toLocaleString()}</div>
            <div className="text-xs text-[#8090b0] mt-1">合計請求額（税込）</div>
          </div>
        </div>
      )}

      {/* 月次テーブル */}
      <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a3050] text-[#8090b0] text-xs">
              <th className="text-left px-4 py-3">月</th>
              <th className="text-right px-4 py-3">大会数</th>
              <th className="text-right px-4 py-3">参加者数</th>
              <th className="text-right px-4 py-3">単価</th>
              <th className="text-right px-4 py-3 font-bold text-[#c9a456]">請求額（税込）</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a3050]">
            {billingSummary.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#8090b0]">
                  終了済みトーナメントがありません
                </td>
              </tr>
            ) : (
              <>
                {billingSummary.map(m => (
                  <tr key={m.month} className="hover:bg-[#1a2040]/50">
                    <td className="px-4 py-3 font-medium">{m.month}</td>
                    <td className="px-4 py-3 text-right">{m.tournamentCount}</td>
                    <td className="px-4 py-3 text-right">{m.totalParticipants.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">¥{unitPrice}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#c9a456]">¥{m.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
                {/* 合計行 */}
                <tr className="bg-[#1a2040]/30 font-bold">
                  <td className="px-4 py-3">合計</td>
                  <td className="px-4 py-3 text-right">{totals.tournaments}</td>
                  <td className="px-4 py-3 text-right">{totals.participants.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">-</td>
                  <td className="px-4 py-3 text-right text-[#c9a456]">¥{totals.amount.toLocaleString()}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
