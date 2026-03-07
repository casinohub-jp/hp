import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { generateId } from '../data/mockData'
import { SkeletonCard } from '../components/LoadingAndEmpty'
import type { GameType, StaffRole } from '../types'

type SettingsSection = 'tables' | 'staff' | 'denominations'

const gameTypeLabels: Record<GameType, string> = {
  holdem: 'ホールデム',
  blackjack: 'ブラックジャック',
  baccarat: 'バカラ',
  roulette: 'ルーレット',
  other: 'その他',
}

const staffRoleLabels: Record<StaffRole, string> = {
  dealer: 'ディーラー',
  floor: 'フロア',
  manager: 'マネージャー',
}

export default function SettingsTab() {
  const [section, setSection] = useState<SettingsSection>('tables')
  const { loading } = useApp()

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3].map(i => <div key={i} className="w-20 h-10 bg-[#2a3050] rounded-lg animate-pulse" />)}
        </div>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* セクション切り替え */}
      <div className="flex gap-2">
        {([
          { id: 'tables', label: 'テーブル' },
          { id: 'staff', label: 'スタッフ' },
          { id: 'denominations', label: 'チップ額面' },
        ] as const).map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              section === s.id ? 'bg-[#2d8a4e] text-white' : 'bg-[#121a2e] text-[#8090b0] border border-[#2a3050]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === 'tables' && <TableSettings />}
      {section === 'staff' && <StaffSettings />}
      {section === 'denominations' && <DenominationSettings />}
    </div>
  )
}

function TableSettings() {
  const { state, dispatch } = useApp()
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newGameType, setNewGameType] = useState<GameType>('holdem')

  const handleAdd = () => {
    if (!newName.trim()) return
    dispatch({
      type: 'ADD_TABLE',
      table: { id: generateId(), name: newName.trim(), gameType: newGameType, isOpen: false },
    })
    setNewName('')
    setIsAdding(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">テーブル管理</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-[#2d8a4e] text-white"
        >
          <Plus size={14} /> 追加
        </button>
      </div>

      {isAdding && (
        <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] p-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-[#8090b0] mb-1 block">テーブル名</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="テーブル6"
              className="w-full bg-[#0d1420] border border-[#2a3050] text-white rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-[#8090b0] mb-1 block">ゲーム</label>
            <select
              value={newGameType}
              onChange={e => setNewGameType(e.target.value as GameType)}
              className="bg-[#0d1420] border border-[#2a3050] text-white rounded-lg px-3 py-2 text-sm"
            >
              {Object.entries(gameTypeLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm bg-[#2d8a4e] text-white">
            追加
          </button>
        </div>
      )}

      <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] divide-y divide-[#2a3050]">
        {state.tables.map(table => (
          <div key={table.id} className="flex items-center justify-between p-4">
            <div>
              <span className="font-medium">{table.name}</span>
              <span className="text-xs text-[#8090b0] ml-2">{gameTypeLabels[table.gameType]}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch({ type: 'TOGGLE_TABLE', id: table.id })}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  table.isOpen
                    ? 'bg-emerald-900/30 text-emerald-400'
                    : 'bg-[#0d1420] text-[#8090b0] border border-[#2a3050]'
                }`}
              >
                {table.isOpen ? '稼働中' : '閉台'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StaffSettings() {
  const { state, dispatch } = useApp()
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<StaffRole>('dealer')

  const handleAdd = () => {
    if (!newName.trim()) return
    dispatch({
      type: 'ADD_STAFF',
      staff: { id: generateId(), name: newName.trim(), role: newRole, isActive: true },
    })
    setNewName('')
    setIsAdding(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">スタッフ管理</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-[#2d8a4e] text-white"
        >
          <Plus size={14} /> 追加
        </button>
      </div>

      {isAdding && (
        <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] p-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-[#8090b0] mb-1 block">名前</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="山田"
              className="w-full bg-[#0d1420] border border-[#2a3050] text-white rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-[#8090b0] mb-1 block">役割</label>
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value as StaffRole)}
              className="bg-[#0d1420] border border-[#2a3050] text-white rounded-lg px-3 py-2 text-sm"
            >
              {Object.entries(staffRoleLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm bg-[#2d8a4e] text-white">
            追加
          </button>
        </div>
      )}

      <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] divide-y divide-[#2a3050]">
        {state.staff.map(s => (
          <div key={s.id} className="flex items-center justify-between p-4">
            <div>
              <span className="font-medium">{s.name}</span>
              <span className="text-xs text-[#8090b0] ml-2">{staffRoleLabels[s.role]}</span>
            </div>
            <button
              onClick={() => dispatch({ type: 'UPDATE_STAFF', staff: { ...s, isActive: !s.isActive } })}
              className={`px-3 py-1 rounded-lg text-xs font-medium ${
                s.isActive
                  ? 'bg-emerald-900/30 text-emerald-400'
                  : 'bg-red-900/30 text-red-400'
              }`}
            >
              {s.isActive ? '有効' : '無効'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function DenominationSettings() {
  const { state } = useApp()

  return (
    <div className="space-y-3">
      <h3 className="font-bold">チップ額面</h3>
      <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] divide-y divide-[#2a3050]">
        {state.denominations.map(d => (
          <div key={d.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span
                className="inline-block w-8 h-8 rounded-full border-2 border-white/20"
                style={{ backgroundColor: d.color }}
              />
              <div>
                <span className="font-medium">{d.label}</span>
                <span className="text-xs text-[#8090b0] ml-2">{d.value.toLocaleString()}円</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-[#8090b0]">
        チップ額面の追加・変更は今後のアップデートで対応予定です。
      </p>
    </div>
  )
}
