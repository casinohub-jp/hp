import { useState, useMemo } from 'react'
import { Search, Trophy, Medal, ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { aggregateLeaderboard, type PlayerStats } from '../lib/leaderboard'

const PAGE_SIZE = 50

type PeriodFilter = 'all' | 'month' | 'week'

export default function LeaderboardPanel() {
  const { state } = useApp()
  const [search, setSearch] = useState('')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all')
  const [page, setPage] = useState(0)
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)

  // 期間フィルタの日付を計算
  const dateRange = useMemo(() => {
    const now = new Date()
    if (periodFilter === 'week') {
      const start = new Date(now)
      start.setDate(start.getDate() - 7)
      return { startDate: start.toISOString().split('T')[0] }
    }
    if (periodFilter === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return { startDate: start.toISOString().split('T')[0] }
    }
    return {}
  }, [periodFilter])

  const leaderboard = useMemo(() => {
    return aggregateLeaderboard(state.tournaments, {
      ...dateRange,
      searchQuery: search || undefined,
    })
  }, [state.tournaments, dateRange, search])

  const totalPages = Math.ceil(leaderboard.length / PAGE_SIZE)
  const pagedData = leaderboard.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // プレイヤー詳細
  const selectedStats = selectedPlayer
    ? leaderboard.find(s => s.playerName === selectedPlayer)
    : null

  if (selectedStats) {
    return (
      <PlayerDetail
        stats={selectedStats}
        rank={leaderboard.indexOf(selectedStats) + 1}
        onBack={() => setSelectedPlayer(null)}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* フィルタ行 */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* 期間フィルタ */}
        <div className="flex gap-1.5">
          {([
            { id: 'all', label: '全期間' },
            { id: 'month', label: '今月' },
            { id: 'week', label: '今週' },
          ] as const).map(f => (
            <button
              key={f.id}
              onClick={() => { setPeriodFilter(f.id); setPage(0) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                periodFilter === f.id
                  ? 'bg-[#2d8a4e] text-white'
                  : 'bg-[#121a2e] text-[#8090b0] border border-[#2a3050] hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 検索 */}
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8090b0]" />
          <input
            type="text"
            placeholder="プレイヤー名で検索..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="w-full pl-9 pr-3 py-1.5 bg-[#121a2e] border border-[#2a3050] rounded-lg text-sm text-white placeholder-[#8090b0] focus:outline-none focus:border-[#2d8a4e]"
          />
        </div>
      </div>

      {/* ランキングテーブル */}
      {leaderboard.length === 0 ? (
        <div className="text-center py-12 text-[#8090b0]">
          <Trophy size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">ランキングデータがありません</p>
          <p className="text-xs mt-1">トーナメントが終了するとランキングが表示されます</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a3050] text-[#8090b0] text-xs">
                  <th className="text-center px-3 py-3 w-12">#</th>
                  <th className="text-left px-3 py-3">プレイヤー</th>
                  <th className="text-right px-3 py-3">ポイント</th>
                  <th className="text-right px-3 py-3 hidden sm:table-cell">参加数</th>
                  <th className="text-right px-3 py-3 hidden sm:table-cell">優勝</th>
                  <th className="text-right px-3 py-3 hidden md:table-cell">入賞</th>
                  <th className="text-right px-3 py-3 hidden md:table-cell">賞金合計</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a3050]">
                {pagedData.map((stats, i) => {
                  const rank = page * PAGE_SIZE + i + 1
                  return (
                    <tr
                      key={stats.playerName}
                      className="hover:bg-[#1a2040]/50 cursor-pointer"
                      onClick={() => setSelectedPlayer(stats.playerName)}
                    >
                      <td className="px-3 py-3 text-center">
                        <RankBadge rank={rank} />
                      </td>
                      <td className="px-3 py-3 font-medium">{stats.playerName}</td>
                      <td className="px-3 py-3 text-right font-bold text-[#c9a456]">
                        {stats.totalPoints.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-right text-[#8090b0] hidden sm:table-cell">
                        {stats.tournamentCount}
                      </td>
                      <td className="px-3 py-3 text-right hidden sm:table-cell">
                        {stats.winCount > 0 ? (
                          <span className="text-yellow-400">{stats.winCount}</span>
                        ) : (
                          <span className="text-[#8090b0]">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right hidden md:table-cell">
                        {stats.topThreeCount > 0 ? (
                          <span className="text-green-400">{stats.topThreeCount}</span>
                        ) : (
                          <span className="text-[#8090b0]">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right hidden md:table-cell">
                        {stats.totalPrize > 0 ? (
                          <span>¥{stats.totalPrize.toLocaleString()}</span>
                        ) : (
                          <span className="text-[#8090b0]">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg bg-[#2a3050] hover:bg-[#3a4060] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-[#8090b0]">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg bg-[#2a3050] hover:bg-[#3a4060] disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return <Medal size={18} className="mx-auto text-yellow-400" />
  }
  if (rank === 2) {
    return <Medal size={18} className="mx-auto text-gray-300" />
  }
  if (rank === 3) {
    return <Medal size={18} className="mx-auto text-amber-600" />
  }
  return <span className="text-[#8090b0] text-xs">{rank}</span>
}

function PlayerDetail({
  stats,
  rank,
  onBack,
}: {
  stats: PlayerStats
  rank: number
  onBack: () => void
}) {
  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-[#8090b0] hover:text-white transition-colors"
      >
        <ChevronLeft size={16} /> ランキングに戻る
      </button>

      <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#2a3050] flex items-center justify-center text-lg font-bold text-[#c9a456]">
            <RankBadge rank={rank} />
          </div>
          <div>
            <h3 className="text-lg font-bold">{stats.playerName}</h3>
            <p className="text-sm text-[#8090b0]">ランキング {rank}位</p>
          </div>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="累計ポイント" value={stats.totalPoints.toLocaleString()} accent />
          <StatCard label="参加回数" value={`${stats.tournamentCount}回`} />
          <StatCard label="優勝" value={`${stats.winCount}回`} />
          <StatCard label="入賞 (3位以内)" value={`${stats.topThreeCount}回`} />
          <StatCard label="最高順位" value={stats.bestFinish > 0 ? `${stats.bestFinish}位` : '-'} />
          <StatCard label="平均順位" value={stats.avgFinish > 0 ? `${stats.avgFinish.toFixed(1)}位` : '-'} />
          <StatCard label="賞金合計" value={stats.totalPrize > 0 ? `¥${stats.totalPrize.toLocaleString()}` : '-'} />
        </div>

        {/* 参加トーナメント履歴 */}
        <h4 className="text-sm font-bold text-[#8090b0] mb-2">参加トーナメント履歴</h4>
        <div className="rounded-lg border border-[#2a3050] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a3050] text-[#8090b0] text-xs">
                <th className="text-left px-3 py-2">日付</th>
                <th className="text-left px-3 py-2">大会名</th>
                <th className="text-right px-3 py-2">順位</th>
                <th className="text-right px-3 py-2">ポイント</th>
                <th className="text-right px-3 py-2 hidden sm:table-cell">賞金</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3050]">
              {stats.recentResults.map((r, i) => (
                <tr key={i} className="hover:bg-[#1a2040]/50">
                  <td className="px-3 py-2 text-[#8090b0]">{r.date}</td>
                  <td className="px-3 py-2">{r.tournamentName}</td>
                  <td className="px-3 py-2 text-right">
                    {r.position > 0 ? (
                      <span className={r.position <= 3 ? 'text-[#c9a456] font-bold' : ''}>
                        {r.position}位
                      </span>
                    ) : (
                      <span className="text-[#8090b0]">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-[#c9a456]">
                    +{r.points}
                  </td>
                  <td className="px-3 py-2 text-right hidden sm:table-cell">
                    {r.prize > 0 ? `¥${r.prize.toLocaleString()}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg bg-[#0d1420] border border-[#2a3050] p-3 text-center">
      <div className={`text-lg font-bold ${accent ? 'text-[#c9a456]' : ''}`}>{value}</div>
      <div className="text-xs text-[#8090b0] mt-0.5">{label}</div>
    </div>
  )
}
