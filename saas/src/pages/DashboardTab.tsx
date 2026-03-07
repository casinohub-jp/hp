import { Trophy, Users, Calendar, Table2 } from 'lucide-react'
import { useApp } from '../contexts/AppContext'

export default function DashboardTab() {
  const { state } = useApp()

  // トーナメント
  const activeTournaments = state.tournaments.filter(t => t.status === 'running' || t.status === 'paused')
  const upcomingTournaments = state.tournaments.filter(t => t.status === 'upcoming' || t.status === 'registering')
  const completedTournaments = state.tournaments.filter(t => t.status === 'finished')
  const totalEntries = state.tournaments.reduce((sum, t) => sum + t.entries.length, 0)

  // テーブル状況
  const openTables = state.tables.filter(t => t.isOpen).length
  const totalTables = state.tables.length

  return (
    <div className="space-y-4">
      {/* サマリーカード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          icon={<Trophy size={20} />}
          label="開催中トーナメント"
          value={activeTournaments.length > 0 ? `${activeTournaments.length}件` : 'なし'}
          color="text-emerald-400"
          bgColor="bg-emerald-900/20"
        />
        <SummaryCard
          icon={<Calendar size={20} />}
          label="予定トーナメント"
          value={upcomingTournaments.length > 0 ? `${upcomingTournaments.length}件` : 'なし'}
          color="text-blue-400"
          bgColor="bg-blue-900/20"
        />
        <SummaryCard
          icon={<Users size={20} />}
          label="累計参加者数"
          value={`${totalEntries}人`}
          color="text-amber-400"
          bgColor="bg-amber-900/20"
        />
        <SummaryCard
          icon={<Table2 size={20} />}
          label="稼働テーブル"
          value={`${openTables} / ${totalTables}`}
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

      {/* トーナメント情報 */}
      <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] p-4">
        <h2 className="text-sm font-bold text-[#8090b0] mb-3">トーナメント</h2>
        {[...activeTournaments, ...upcomingTournaments].length === 0 ? (
          <p className="text-sm text-[#8090b0]">予定されているトーナメントはありません</p>
        ) : (
          <div className="space-y-2">
            {[...activeTournaments, ...upcomingTournaments].slice(0, 5).map(t => {
              const statusLabel: Record<string, string> = {
                upcoming: '予定',
                registering: '受付中',
                running: '開催中',
                paused: '一時停止',
              }
              const statusColor: Record<string, string> = {
                upcoming: 'text-[#8090b0]',
                registering: 'text-blue-400',
                running: 'text-emerald-400',
                paused: 'text-amber-400',
              }
              return (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-[#2a3050] last:border-0">
                  <div>
                    <span className="text-sm font-medium">{t.name}</span>
                    <span className="text-xs text-[#8090b0] ml-2">{t.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#8090b0]">{t.entries.length}/{t.maxPlayers}人</span>
                    <span className={`text-xs font-bold ${statusColor[t.status]}`}>
                      {statusLabel[t.status]}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 直近の完了トーナメント */}
      {completedTournaments.length > 0 && (
        <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] p-4">
          <h2 className="text-sm font-bold text-[#8090b0] mb-3">直近の完了トーナメント</h2>
          <div className="space-y-2">
            {completedTournaments.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-[#2a3050] last:border-0">
                <div>
                  <span className="text-sm font-medium">{t.name}</span>
                  <span className="text-xs text-[#8090b0] ml-2">{t.date}</span>
                </div>
                <span className="text-xs text-[#8090b0]">{t.entries.length}人参加</span>
              </div>
            ))}
          </div>
        </div>
      )}
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
