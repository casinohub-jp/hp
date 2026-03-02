import { useState } from 'react'
import { LayoutDashboard, Coins, ClipboardCheck, BarChart3, Settings } from 'lucide-react'
import DashboardTab from './DashboardTab'
import ChipManagementTab from './ChipManagementTab'
import InventoryTab from './InventoryTab'
import ReportTab from './ReportTab'
import SettingsTab from './SettingsTab'

type Tab = 'dashboard' | 'chips' | 'inventory' | 'report' | 'settings'

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { id: 'chips', label: 'チップ管理', icon: Coins },
  { id: 'inventory', label: '棚卸し', icon: ClipboardCheck },
  { id: 'report', label: '売上レポート', icon: BarChart3 },
  { id: 'settings', label: '設定', icon: Settings },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  return (
    <div className="min-h-screen bg-[#0d1420] text-white">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-[#1a2040] border-b border-[#2a3050] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2d8a4e] flex items-center justify-center font-bold text-sm">
            C
          </div>
          <h1 className="text-lg font-bold tracking-wide">Casinohub</h1>
          <span className="text-xs text-[#8090b0] ml-1">カジノ店舗管理</span>
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
        {activeTab === 'chips' && <ChipManagementTab />}
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'report' && <ReportTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  )
}
