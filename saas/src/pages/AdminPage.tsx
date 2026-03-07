import { useState } from 'react'
import { LayoutDashboard, BarChart3, Settings, Trophy, Award, LogOut } from 'lucide-react'
import DashboardTab from './DashboardTab'
import ReportTab from './ReportTab'
import SettingsTab from './SettingsTab'
import TournamentTab from './TournamentTab'
import LeaderboardPanel from '../components/LeaderboardPanel'
import { useAuth } from '../contexts/AuthContext'

type Tab = 'dashboard' | 'tournament' | 'leaderboard' | 'report' | 'settings'

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { id: 'tournament', label: 'トーナメント', icon: Trophy },
  { id: 'leaderboard', label: 'ランキング', icon: Award },
  { id: 'report', label: '売上レポート', icon: BarChart3 },
  { id: 'settings', label: '設定', icon: Settings },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const { logout, user } = useAuth()

  return (
    <div className="min-h-screen bg-[#0d1420] text-white">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-[#1a2040] border-b border-[#2a3050] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2d8a4e] flex items-center justify-center font-bold text-sm">
            C
          </div>
          <h1 className="text-lg font-bold tracking-wide">Casinohub</h1>
          <span className="text-xs text-[#8090b0] ml-1">トーナメント管理</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-[#8090b0] hidden sm:inline">{user?.email}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#8090b0] hover:text-white hover:bg-[#2a3050] rounded-lg transition-colors"
              title="ログアウト"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">ログアウト</span>
            </button>
          </div>
        </div>
      </header>

      {/* タブナビゲーション */}
      <nav className="sticky top-[53px] z-40 bg-[#121a2e] border-b border-[#2a3050]">
        <div className="max-w-6xl mx-auto flex overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#2d8a4e] text-[#2d8a4e]'
                    : 'border-transparent text-[#8090b0] hover:text-white'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* コンテンツ */}
      <main className="max-w-6xl mx-auto p-4">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'tournament' && <TournamentTab />}
        {activeTab === 'leaderboard' && <LeaderboardPanel />}
        {activeTab === 'report' && <ReportTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  )
}
