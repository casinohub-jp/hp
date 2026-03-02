import { Coins, TrendingUp, Table2, Users } from 'lucide-react'
import { useApp } from '../contexts/AppContext'

export default function DashboardTab() {
  const { state } = useApp()
  const today = new Date().toISOString().split('T')[0]

  // 今日の取引
  const todayTransactions = state.transactions.filter(t => t.createdAt.startsWith(today))
  const todayPurchases = todayTransactions.filter(t => t.type === 'purchase')
  const todayChipSales = todayPurchases.reduce((sum, t) => sum + (t.cashAmount || 0), 0)

  // テーブル状況
  const openTables = state.tables.filter(t => t.isOpen).length
  const totalTables = state.tables.length

  // 今日の売上
  const todaySales = state.dailySales.find(s => s.date === today)

  // 直近の取引（5件）
  const recentTransactions = state.transactions.slice(0, 5)

  const typeLabels: Record<string, string> = {
    purchase: 'チップ購入',
    return: 'チップ返却',
    fill: 'フロート補充',
    collect: 'チップ回収',
  }

  const typeColors: Record<string, string> = {
    purchase: 'text-emerald-400',
    return: 'text-blue-400',
    fill: 'text-amber-400',
    collect: 'text-purple-400',
  }

  return (
    <div className="space-y-4">
      {/* サマリーカード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          icon={<Coins size={20} />}
          label="本日チップ売上"
          value={`¥${todayChipSales.toLocaleString()}`}
          color="text-emerald-400"
          bgColor="bg-emerald-900/20"
        />
        <SummaryCard
          icon={<TrendingUp size={20} />}
          label="本日売上合計"
          value={`¥${(todaySales?.totalSales || todayChipSales).toLocaleString()}`}
          color="text-[#c9a456]"
          bgColor="bg-[#c9a456]/10"
        />
        <SummaryCard
          icon={<Table2 size={20} />}
          label="稼働テーブル"
          value={`${openTables} / ${totalTables}`}
          color="text-blue-400"
          bgColor="bg-blue-900/20"
        />
        <SummaryCard
          icon={<Users size={20} />}
          label="本日取引数"
          value={`${todayTransactions.length}件`}
          color="text-purple-400"
          bgColor="bg-purple-900/20"
        />
      </div>

      {/* テーブル状況 */}
      <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] p-4">
        <h2 className="text-sm font-bold text-[#8090b0] mb-3">テーブル状況</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {state.tables.map(table => (
            <div
              key={table.id}
              className={`rounded-lg p-3 text-center border ${
                table.isOpen
                  ? 'border-[#2d8a4e]/50 bg-[#2d8a4e]/10'
                  : 'border-[#2a3050] bg-[#0d1420]'
              }`}
            >
              <div className="text-sm font-bold">{table.name}</div>
              <div className="text-xs text-[#8090b0] mt-1">
                {gameTypeLabel(table.gameType)}
              </div>
              <div className={`text-xs mt-1 ${table.isOpen ? 'text-emerald-400' : 'text-[#8090b0]'}`}>
                {table.isOpen ? '稼働中' : '閉台'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 直近の取引 */}
      <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] p-4">
        <h2 className="text-sm font-bold text-[#8090b0] mb-3">直近の取引</h2>
        {recentTransactions.length === 0 ? (
          <p className="text-sm text-[#8090b0]">取引がありません</p>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-[#2a3050] last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${typeColors[tx.type]}`}>
                    {typeLabels[tx.type]}
                  </span>
                  <span className="text-xs text-[#8090b0]">
                    {new Date(tx.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {tx.staffName && (
                    <span className="text-xs text-[#8090b0]">{tx.staffName}</span>
                  )}
                </div>
                {tx.cashAmount != null && (
                  <span className="text-sm font-bold">¥{tx.cashAmount.toLocaleString()}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ icon, label, value, color, bgColor }: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
  bgColor: string
}) {
  return (
    <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] p-4">
      <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center ${color} mb-2`}>
        {icon}
      </div>
      <div className="text-xs text-[#8090b0]">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  )
}

function gameTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    holdem: 'ホールデム',
    blackjack: 'ブラックジャック',
    baccarat: 'バカラ',
    roulette: 'ルーレット',
    other: 'その他',
  }
  return labels[type] || type
}
