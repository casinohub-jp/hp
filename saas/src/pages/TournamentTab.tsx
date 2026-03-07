import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Play, Pause, SkipForward, Square, Trophy, Users, Clock,
  ChevronLeft, UserPlus, RefreshCw, Award, Trash2, LayoutGrid,
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { generateId } from '../data/mockData'
import { distributePrizes } from '../lib/tournament-utils'
import { assignPlayersToTables, type TableAssignment } from '../lib/table-assignment'
import type { Tournament, BlindLevel, TournamentEntry, PrizeLevel, TournamentStatus } from '../types'

// デフォルトのブラインド構造（20分レベル）
const defaultBlindStructure: BlindLevel[] = [
  { level: 1, smallBlind: 25, bigBlind: 50, ante: 0, durationMinutes: 20 },
  { level: 2, smallBlind: 50, bigBlind: 100, ante: 0, durationMinutes: 20 },
  { level: 3, smallBlind: 75, bigBlind: 150, ante: 25, durationMinutes: 20 },
  { level: 4, smallBlind: 100, bigBlind: 200, ante: 25, durationMinutes: 20 },
  { level: 5, smallBlind: 150, bigBlind: 300, ante: 50, durationMinutes: 20 },
  { level: 6, smallBlind: 200, bigBlind: 400, ante: 50, durationMinutes: 20 },
  { level: 7, smallBlind: 300, bigBlind: 600, ante: 75, durationMinutes: 15 },
  { level: 8, smallBlind: 400, bigBlind: 800, ante: 100, durationMinutes: 15 },
  { level: 9, smallBlind: 500, bigBlind: 1000, ante: 100, durationMinutes: 15 },
  { level: 10, smallBlind: 750, bigBlind: 1500, ante: 200, durationMinutes: 15 },
  { level: 11, smallBlind: 1000, bigBlind: 2000, ante: 300, durationMinutes: 10 },
  { level: 12, smallBlind: 1500, bigBlind: 3000, ante: 400, durationMinutes: 10 },
]

const defaultPrizeStructure: PrizeLevel[] = [
  { position: 1, percentage: 50, label: '1位' },
  { position: 2, percentage: 30, label: '2位' },
  { position: 3, percentage: 20, label: '3位' },
]

// ステータスの日本語ラベル
const statusLabels: Record<TournamentStatus, string> = {
  upcoming: '準備中',
  registering: '受付中',
  running: '進行中',
  paused: '一時停止',
  finished: '終了',
}

const statusColors: Record<TournamentStatus, string> = {
  upcoming: 'bg-gray-600',
  registering: 'bg-blue-600',
  running: 'bg-green-600',
  paused: 'bg-amber-600',
  finished: 'bg-gray-500',
}

export default function TournamentTab() {
  const { state } = useApp()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const selected = state.tournaments.find(t => t.id === selectedId) ?? null

  if (showCreate) {
    return <CreateTournament onClose={() => setShowCreate(false)} />
  }

  if (selected) {
    return <TournamentDetail tournament={selected} onBack={() => setSelectedId(null)} />
  }

  // 一覧
  const activeTournaments = state.tournaments.filter(t => t.status !== 'finished')
  const pastTournaments = state.tournaments.filter(t => t.status === 'finished')

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">トーナメント管理</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2d8a4e] hover:bg-[#247a42] rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          新規作成
        </button>
      </div>

      {/* 進行中・予定 */}
      {activeTournaments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[#8090b0]">進行中・予定</h3>
          {activeTournaments.map(t => (
            <TournamentCard key={t.id} tournament={t} onClick={() => setSelectedId(t.id)} />
          ))}
        </div>
      )}

      {/* 終了済み */}
      {pastTournaments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[#8090b0]">終了済み</h3>
          {pastTournaments.map(t => (
            <TournamentCard key={t.id} tournament={t} onClick={() => setSelectedId(t.id)} />
          ))}
        </div>
      )}

      {state.tournaments.length === 0 && (
        <div className="text-center py-16 text-[#8090b0]">
          <Trophy size={48} className="mx-auto mb-4 opacity-40" />
          <p>トーナメントがまだありません</p>
          <p className="text-sm mt-1">「新規作成」から最初のトーナメントを作成してください</p>
        </div>
      )}
    </div>
  )
}

// --- トーナメントカード ---
function TournamentCard({ tournament: t, onClick }: { tournament: Tournament; onClick: () => void }) {
  const activePlayers = t.entries.filter(e => !e.eliminatedAt).length
  const totalEntries = t.entries.length
  const totalRebuys = t.entries.reduce((sum, e) => sum + e.rebuys, 0)
  const prizePool = totalEntries * t.entryFee + totalRebuys * t.rebuyFee

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#121a2e] border border-[#2a3050] rounded-xl p-4 hover:border-[#2d8a4e] transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[t.status]} text-white`}>
              {statusLabels[t.status]}
            </span>
            <span className="text-xs text-[#8090b0]">{t.date}</span>
          </div>
          <h3 className="font-bold">{t.name}</h3>
        </div>
        <div className="text-right text-sm">
          <div className="text-[#c9a456] font-bold">¥{prizePool.toLocaleString()}</div>
          <div className="text-[#8090b0] text-xs">賞金プール</div>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-[#8090b0]">
        <span className="flex items-center gap-1">
          <Users size={12} />
          {t.status === 'running' || t.status === 'paused'
            ? `残 ${activePlayers} / ${totalEntries}人`
            : `${totalEntries} / ${t.maxPlayers}人`
          }
        </span>
        <span>エントリー ¥{t.entryFee.toLocaleString()}</span>
        <span>リバイ {totalRebuys}回</span>
        {t.status === 'running' && (
          <span className="flex items-center gap-1">
            <Clock size={12} />
            Lv.{t.blindStructure[t.currentLevel]?.level ?? '-'}
          </span>
        )}
      </div>
    </button>
  )
}

// --- 新規作成 ---
function CreateTournament({ onClose }: { onClose: () => void }) {
  const { dispatch } = useApp()
  const [name, setName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [entryFee, setEntryFee] = useState(3000)
  const [rebuyFee, setRebuyFee] = useState(2000)
  const [addonFee, setAddonFee] = useState(1000)
  const [startingChips, setStartingChips] = useState(10000)
  const [maxPlayers, setMaxPlayers] = useState(30)

  const handleSubmit = () => {
    if (!name.trim()) return
    const tournament: Tournament = {
      id: generateId(),
      name: name.trim(),
      date,
      status: 'upcoming',
      entryFee,
      rebuyFee,
      addonFee,
      startingChips,
      maxPlayers,
      blindStructure: defaultBlindStructure,
      currentLevel: 0,
      entries: [],
      prizeStructure: defaultPrizeStructure,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_TOURNAMENT', tournament })
    onClose()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onClose} className="p-1 hover:bg-[#2a3050] rounded-lg">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-bold">トーナメント新規作成</h2>
      </div>

      <div className="bg-[#121a2e] border border-[#2a3050] rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-[#8090b0] mb-1">トーナメント名</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例: デイリートーナメント"
            className="w-full bg-[#0d1420] border border-[#2a3050] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d8a4e]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#8090b0] mb-1">開催日</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-[#0d1420] border border-[#2a3050] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d8a4e]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#8090b0] mb-1">最大人数</label>
            <input
              type="number"
              value={maxPlayers}
              onChange={e => setMaxPlayers(Number(e.target.value))}
              className="w-full bg-[#0d1420] border border-[#2a3050] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d8a4e]"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-[#8090b0] mb-1">エントリーフィー</label>
            <input
              type="number"
              value={entryFee}
              onChange={e => setEntryFee(Number(e.target.value))}
              className="w-full bg-[#0d1420] border border-[#2a3050] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d8a4e]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#8090b0] mb-1">リバイフィー</label>
            <input
              type="number"
              value={rebuyFee}
              onChange={e => setRebuyFee(Number(e.target.value))}
              className="w-full bg-[#0d1420] border border-[#2a3050] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d8a4e]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#8090b0] mb-1">アドオンフィー</label>
            <input
              type="number"
              value={addonFee}
              onChange={e => setAddonFee(Number(e.target.value))}
              className="w-full bg-[#0d1420] border border-[#2a3050] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d8a4e]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[#8090b0] mb-1">初期チップ</label>
          <input
            type="number"
            value={startingChips}
            onChange={e => setStartingChips(Number(e.target.value))}
            className="w-full bg-[#0d1420] border border-[#2a3050] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d8a4e]"
          />
        </div>

        <div className="text-sm text-[#8090b0]">
          ブラインド構造: デフォルト12レベル（20分→15分→10分）。作成後に編集可能です。
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex-1 bg-[#2d8a4e] hover:bg-[#247a42] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg py-2.5 text-sm font-medium transition-colors"
          >
            作成
          </button>
          <button
            onClick={onClose}
            className="px-6 bg-[#2a3050] hover:bg-[#3a4060] rounded-lg py-2.5 text-sm transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}

// --- トーナメント詳細 ---
function TournamentDetail({ tournament: t, onBack }: { tournament: Tournament; onBack: () => void }) {
  const { dispatch } = useApp()
  const [subTab, setSubTab] = useState<'timer' | 'entries' | 'tables' | 'prizes'>('timer')
  const [tableAssignments, setTableAssignments] = useState<TableAssignment[]>([])
  const [newPlayerName, setNewPlayerName] = useState('')

  const update = useCallback((partial: Partial<Tournament>) => {
    dispatch({ type: 'UPDATE_TOURNAMENT', tournament: { ...t, ...partial } })
  }, [dispatch, t])

  const activePlayers = t.entries.filter(e => !e.eliminatedAt)
  const totalRebuys = t.entries.reduce((sum, e) => sum + e.rebuys, 0)
  const totalAddons = t.entries.reduce((sum, e) => sum + e.addons, 0)
  const prizePool = t.entries.length * t.entryFee + totalRebuys * t.rebuyFee + totalAddons * t.addonFee

  // エントリー追加
  const addEntry = () => {
    if (!newPlayerName.trim()) return
    if (t.entries.length >= t.maxPlayers) return
    const entry: TournamentEntry = {
      id: generateId(),
      playerName: newPlayerName.trim(),
      rebuys: 0,
      addons: 0,
      enteredAt: new Date().toISOString(),
    }
    update({ entries: [...t.entries, entry] })
    setNewPlayerName('')
  }

  // リバイ
  const addRebuy = (entryId: string) => {
    update({
      entries: t.entries.map(e =>
        e.id === entryId ? { ...e, rebuys: e.rebuys + 1 } : e
      ),
    })
  }

  // 脱落
  const eliminatePlayer = (entryId: string) => {
    const position = activePlayers.length
    update({
      entries: t.entries.map(e =>
        e.id === entryId
          ? { ...e, eliminatedAt: new Date().toISOString(), finishPosition: position }
          : e
      ),
    })
  }

  // 脱落取消
  const reinstatePlayer = (entryId: string) => {
    update({
      entries: t.entries.map(e =>
        e.id === entryId
          ? { ...e, eliminatedAt: undefined, finishPosition: undefined }
          : e
      ),
    })
  }

  // ステータス変更
  const startRegistration = () => update({ status: 'registering' })
  const startTournament = () => update({
    status: 'running',
    currentLevel: 0,
    levelStartedAt: new Date().toISOString(),
  })
  const pauseTournament = () => update({ status: 'paused', levelStartedAt: undefined })
  const resumeTournament = () => update({
    status: 'running',
    levelStartedAt: new Date().toISOString(),
  })
  const nextLevel = () => {
    if (t.currentLevel < t.blindStructure.length - 1) {
      update({
        currentLevel: t.currentLevel + 1,
        levelStartedAt: new Date().toISOString(),
      })
    }
  }
  const finishTournament = () => {
    // 残ったプレイヤーに1位を付与
    const remaining = t.entries.filter(e => !e.eliminatedAt)
    const prizeEntries = t.entries.map(e => {
      if (!e.eliminatedAt && remaining.length === 1) {
        return { ...e, finishPosition: 1 }
      }
      return e
    })
    // 賞金を配分
    const finalEntries = distributePrizes(prizeEntries, prizePool, t.prizeStructure)
    update({ status: 'finished', entries: finalEntries, levelStartedAt: undefined })
  }

  const deleteTournament = () => {
    dispatch({ type: 'DELETE_TOURNAMENT', id: t.id })
    onBack()
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-1 hover:bg-[#2a3050] rounded-lg">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{t.name}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[t.status]}`}>
              {statusLabels[t.status]}
            </span>
          </div>
          <div className="text-xs text-[#8090b0]">{t.date}</div>
        </div>
        {t.status === 'upcoming' && (
          <button onClick={deleteTournament} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#121a2e] border border-[#2a3050] rounded-xl p-3 text-center">
          <div className="text-[#c9a456] font-bold text-lg">¥{prizePool.toLocaleString()}</div>
          <div className="text-xs text-[#8090b0]">賞金プール</div>
        </div>
        <div className="bg-[#121a2e] border border-[#2a3050] rounded-xl p-3 text-center">
          <div className="font-bold text-lg">{activePlayers.length}<span className="text-sm text-[#8090b0]">/{t.entries.length}</span></div>
          <div className="text-xs text-[#8090b0]">残りプレイヤー</div>
        </div>
        <div className="bg-[#121a2e] border border-[#2a3050] rounded-xl p-3 text-center">
          <div className="font-bold text-lg">{totalRebuys}</div>
          <div className="text-xs text-[#8090b0]">リバイ</div>
        </div>
        <div className="bg-[#121a2e] border border-[#2a3050] rounded-xl p-3 text-center">
          <div className="font-bold text-lg">Lv.{t.blindStructure[t.currentLevel]?.level ?? '-'}</div>
          <div className="text-xs text-[#8090b0]">ブラインド</div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-2">
        {t.status === 'upcoming' && (
          <button onClick={startRegistration} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
            <Users size={16} /> 受付開始
          </button>
        )}
        {t.status === 'registering' && (
          <button onClick={startTournament} disabled={t.entries.length < 2} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 rounded-lg text-sm font-medium transition-colors">
            <Play size={16} /> 開始
          </button>
        )}
        {t.status === 'running' && (
          <>
            <button onClick={pauseTournament} className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-medium transition-colors">
              <Pause size={16} /> 一時停止
            </button>
            <button onClick={nextLevel} disabled={t.currentLevel >= t.blindStructure.length - 1} className="flex items-center gap-2 px-4 py-2 bg-[#2a3050] hover:bg-[#3a4060] disabled:opacity-40 rounded-lg text-sm font-medium transition-colors">
              <SkipForward size={16} /> 次のレベル
            </button>
            {activePlayers.length <= 1 && (
              <button onClick={finishTournament} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">
                <Square size={16} /> 終了
              </button>
            )}
          </>
        )}
        {t.status === 'paused' && (
          <>
            <button onClick={resumeTournament} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors">
              <Play size={16} /> 再開
            </button>
            <button onClick={finishTournament} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">
              <Square size={16} /> 終了
            </button>
          </>
        )}
      </div>

      {/* サブタブ */}
      <div className="flex border-b border-[#2a3050]">
        {[
          { id: 'timer' as const, label: 'タイマー', icon: Clock },
          { id: 'entries' as const, label: 'エントリー', icon: Users },
          { id: 'tables' as const, label: 'テーブル', icon: LayoutGrid },
          { id: 'prizes' as const, label: '賞金', icon: Award },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors ${
              subTab === tab.id
                ? 'border-[#2d8a4e] text-[#2d8a4e]'
                : 'border-transparent text-[#8090b0] hover:text-white'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* タイマータブ */}
      {subTab === 'timer' && <BlindTimer tournament={t} onNextLevel={nextLevel} />}

      {/* エントリータブ */}
      {subTab === 'entries' && (
        <div className="space-y-4">
          {/* エントリー追加フォーム */}
          {(t.status === 'registering' || t.status === 'running') && t.entries.length < t.maxPlayers && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={e => setNewPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addEntry()}
                placeholder="プレイヤー名"
                className="flex-1 bg-[#0d1420] border border-[#2a3050] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d8a4e]"
              />
              <button
                onClick={addEntry}
                disabled={!newPlayerName.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#2d8a4e] hover:bg-[#247a42] disabled:opacity-40 rounded-lg text-sm font-medium transition-colors"
              >
                <UserPlus size={14} /> 追加
              </button>
            </div>
          )}

          {/* アクティブプレイヤー */}
          {activePlayers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#8090b0]">参加中 ({activePlayers.length}人)</h4>
              {activePlayers.map(e => (
                <div key={e.id} className="flex items-center justify-between bg-[#121a2e] border border-[#2a3050] rounded-lg px-4 py-3">
                  <div>
                    <span className="font-medium">{e.playerName}</span>
                    {e.rebuys > 0 && (
                      <span className="ml-2 text-xs text-amber-400">リバイ ×{e.rebuys}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {(t.status === 'running' || t.status === 'registering') && (
                      <button
                        onClick={() => addRebuy(e.id)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 rounded text-xs transition-colors"
                      >
                        <RefreshCw size={12} /> リバイ
                      </button>
                    )}
                    {(t.status === 'running' || t.status === 'paused') && (
                      <button
                        onClick={() => eliminatePlayer(e.id)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded text-xs transition-colors"
                      >
                        脱落
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 脱落済みプレイヤー */}
          {t.entries.filter(e => e.eliminatedAt).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#8090b0]">脱落済み</h4>
              {t.entries
                .filter(e => e.eliminatedAt)
                .sort((a, b) => (a.finishPosition ?? 999) - (b.finishPosition ?? 999))
                .map(e => (
                  <div key={e.id} className="flex items-center justify-between bg-[#121a2e] border border-[#2a3050] rounded-lg px-4 py-3 opacity-60">
                    <div>
                      <span className="text-sm text-[#8090b0]">#{e.finishPosition}</span>
                      <span className="ml-2">{e.playerName}</span>
                      {e.prizeAmount != null && e.prizeAmount > 0 && (
                        <span className="ml-2 text-xs text-[#c9a456]">¥{e.prizeAmount.toLocaleString()}</span>
                      )}
                    </div>
                    {t.status !== 'finished' && (
                      <button
                        onClick={() => reinstatePlayer(e.id)}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        復帰
                      </button>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* テーブル割当タブ */}
      {subTab === 'tables' && (
        <TableAssignmentPanel
          tournament={t}
          assignments={tableAssignments}
          onAssign={(assignments) => {
            setTableAssignments(assignments)
            // エントリーにtableId/seatNumberを反映
            const entryMap = new Map<string, { tableId: string; seatNumber: number }>()
            for (const a of assignments) {
              for (const e of a.entries) {
                entryMap.set(e.id, { tableId: a.tableId, seatNumber: e.seatNumber ?? 0 })
              }
            }
            const updatedEntries = t.entries.map(e => {
              const assigned = entryMap.get(e.id)
              if (assigned) return { ...e, tableId: assigned.tableId, seatNumber: assigned.seatNumber }
              return e
            })
            update({ entries: updatedEntries })
          }}
        />
      )}

      {/* 賞金タブ */}
      {subTab === 'prizes' && (
        <div className="space-y-4">
          <div className="bg-[#121a2e] border border-[#2a3050] rounded-xl p-4">
            <div className="text-sm text-[#8090b0] mb-2">賞金プール</div>
            <div className="text-2xl font-bold text-[#c9a456]">¥{prizePool.toLocaleString()}</div>
            <div className="text-xs text-[#8090b0] mt-1">
              エントリー {t.entries.length}人 × ¥{t.entryFee.toLocaleString()} + リバイ {totalRebuys}回 × ¥{t.rebuyFee.toLocaleString()} + アドオン {totalAddons}回 × ¥{t.addonFee.toLocaleString()}
            </div>
          </div>

          <div className="bg-[#121a2e] border border-[#2a3050] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a3050] text-[#8090b0]">
                  <th className="text-left px-4 py-3 font-medium">順位</th>
                  <th className="text-right px-4 py-3 font-medium">配分</th>
                  <th className="text-right px-4 py-3 font-medium">賞金額</th>
                  <th className="text-left px-4 py-3 font-medium">プレイヤー</th>
                </tr>
              </thead>
              <tbody>
                {t.prizeStructure.map(p => {
                  const amount = Math.floor(prizePool * p.percentage / 100)
                  const winner = t.entries.find(e => e.finishPosition === p.position)
                  return (
                    <tr key={p.position} className="border-b border-[#2a3050]/50">
                      <td className="px-4 py-3 font-medium">{p.label}</td>
                      <td className="px-4 py-3 text-right text-[#8090b0]">{p.percentage}%</td>
                      <td className="px-4 py-3 text-right text-[#c9a456] font-bold">¥{amount.toLocaleString()}</td>
                      <td className="px-4 py-3">{winner?.playerName ?? '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// --- ブラインドタイマー ---
function BlindTimer({ tournament: t, onNextLevel }: { tournament: Tournament; onNextLevel: () => void }) {
  const currentBlind = t.blindStructure[t.currentLevel]
  const nextBlind = t.blindStructure[t.currentLevel + 1]

  const [remainingSeconds, setRemainingSeconds] = useState(0)

  useEffect(() => {
    if (t.status !== 'running' || !t.levelStartedAt || !currentBlind) {
      setRemainingSeconds(currentBlind ? currentBlind.durationMinutes * 60 : 0)
      return
    }

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - new Date(t.levelStartedAt!).getTime()) / 1000)
      const remaining = Math.max(0, currentBlind.durationMinutes * 60 - elapsed)
      setRemainingSeconds(remaining)
      if (remaining === 0 && nextBlind) {
        onNextLevel()
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [t.status, t.levelStartedAt, currentBlind, nextBlind, onNextLevel])

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  if (!currentBlind) return null

  return (
    <div className="space-y-4">
      {/* 現在のレベル */}
      <div className="bg-[#121a2e] border border-[#2a3050] rounded-xl p-6 text-center">
        <div className="text-sm text-[#8090b0] mb-2">Level {currentBlind.level}</div>
        <div className="text-4xl font-bold mb-2">
          {currentBlind.smallBlind.toLocaleString()} / {currentBlind.bigBlind.toLocaleString()}
        </div>
        {currentBlind.ante > 0 && (
          <div className="text-sm text-[#c9a456]">アンティ {currentBlind.ante.toLocaleString()}</div>
        )}

        {/* タイマー */}
        <div className={`text-6xl font-mono font-bold mt-4 ${
          remainingSeconds <= 60 ? 'text-red-400' : remainingSeconds <= 180 ? 'text-amber-400' : 'text-white'
        }`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="text-xs text-[#8090b0] mt-1">{currentBlind.durationMinutes}分</div>
      </div>

      {/* 次のレベルプレビュー */}
      {nextBlind && (
        <div className="bg-[#121a2e] border border-[#2a3050] rounded-xl p-4">
          <div className="text-xs text-[#8090b0] mb-1">次のレベル: Level {nextBlind.level}</div>
          <div className="text-lg font-bold">
            {nextBlind.smallBlind.toLocaleString()} / {nextBlind.bigBlind.toLocaleString()}
            {nextBlind.ante > 0 && (
              <span className="text-sm text-[#c9a456] ml-2">アンティ {nextBlind.ante.toLocaleString()}</span>
            )}
          </div>
        </div>
      )}

      {/* ブラインド構造一覧 */}
      <div className="bg-[#121a2e] border border-[#2a3050] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2a3050] text-sm font-medium text-[#8090b0]">
          ブラインド構造
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a3050] text-[#8090b0]">
              <th className="text-left px-4 py-2 font-medium">Lv</th>
              <th className="text-right px-4 py-2 font-medium">SB</th>
              <th className="text-right px-4 py-2 font-medium">BB</th>
              <th className="text-right px-4 py-2 font-medium">アンティ</th>
              <th className="text-right px-4 py-2 font-medium">時間</th>
            </tr>
          </thead>
          <tbody>
            {t.blindStructure.map((bl, i) => (
              <tr
                key={bl.level}
                className={`border-b border-[#2a3050]/30 ${
                  i === t.currentLevel ? 'bg-[#2d8a4e]/20 text-white' : i < t.currentLevel ? 'text-[#8090b0]/50' : ''
                }`}
              >
                <td className="px-4 py-2">{bl.level}</td>
                <td className="px-4 py-2 text-right">{bl.smallBlind.toLocaleString()}</td>
                <td className="px-4 py-2 text-right">{bl.bigBlind.toLocaleString()}</td>
                <td className="px-4 py-2 text-right">{bl.ante > 0 ? bl.ante.toLocaleString() : '-'}</td>
                <td className="px-4 py-2 text-right">{bl.durationMinutes}分</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// --- テーブル割当パネル ---
function TableAssignmentPanel({
  tournament: t,
  assignments,
  onAssign,
}: {
  tournament: Tournament
  assignments: TableAssignment[]
  onAssign: (assignments: TableAssignment[]) => void
}) {
  const { state } = useApp()
  const [maxPerTable, setMaxPerTable] = useState(9)

  const activeEntries = t.entries.filter(e => !e.eliminatedAt)
  const availableTables = state.tables

  const handleAssign = () => {
    if (availableTables.length === 0 || activeEntries.length === 0) return
    const result = assignPlayersToTables(t.entries, availableTables, maxPerTable)
    onAssign(result)
  }

  return (
    <div className="space-y-4">
      {/* 設定 */}
      <div className="bg-[#121a2e] border border-[#2a3050] rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm text-[#8090b0] mb-1">テーブルあたり最大人数</label>
            <input
              type="number"
              value={maxPerTable}
              onChange={e => setMaxPerTable(Math.max(2, Number(e.target.value)))}
              min={2}
              max={12}
              className="w-24 bg-[#0d1420] border border-[#2a3050] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d8a4e]"
            />
          </div>
          <div className="text-sm text-[#8090b0]">
            <div>参加中: {activeEntries.length}人</div>
            <div>テーブル: {availableTables.length}卓</div>
          </div>
        </div>

        <button
          onClick={handleAssign}
          disabled={availableTables.length === 0 || activeEntries.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2d8a4e] hover:bg-[#247a42] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
        >
          <LayoutGrid size={16} />
          テーブルを割り当てる
        </button>

        {availableTables.length === 0 && (
          <p className="text-xs text-amber-400">
            テーブルが登録されていません。設定タブからテーブルを追加してください。
          </p>
        )}
      </div>

      {/* 割当結果 */}
      {assignments.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[#8090b0]">割当結果</h4>
          {assignments.map(a => (
            <div key={a.tableId} className="bg-[#121a2e] border border-[#2a3050] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#2a3050] flex items-center justify-between">
                <span className="font-medium">{a.tableName}</span>
                <span className="text-xs text-[#8090b0]">{a.entries.length}人</span>
              </div>
              <div className="divide-y divide-[#2a3050]/30">
                {a.entries.map(e => (
                  <div key={e.id} className="px-4 py-2.5 flex items-center justify-between text-sm">
                    <span>{e.playerName}</span>
                    <span className="text-xs text-[#8090b0]">Seat {e.seatNumber}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// distributePrizes は src/lib/tournament-utils.ts に移動済み
