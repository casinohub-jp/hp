import { useState } from 'react'
import { Plus, ArrowDownToLine, ArrowUpFromLine, RotateCcw, Download } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { generateId } from '../data/mockData'
import { exportTransactionsCSV } from '../lib/csvExport'
import type { ChipTransactionType, ChipBreakdown } from '../types'

type SubTab = 'log' | 'new'

export default function ChipManagementTab() {
  const { state } = useApp()
  const [subTab, setSubTab] = useState<SubTab>('log')

  // 取引種別のフィルター
  const [filterType, setFilterType] = useState<ChipTransactionType | 'all'>('all')

  const filtered = filterType === 'all'
    ? state.transactions
    : state.transactions.filter(t => t.type === filterType)

  const typeLabels: Record<string, string> = {
    purchase: 'チップ購入',
    return: 'チップ返却',
    fill: 'フロート補充',
    collect: 'チップ回収',
  }

  const typeColors: Record<string, string> = {
    purchase: 'bg-emerald-900/30 text-emerald-400',
    return: 'bg-blue-900/30 text-blue-400',
    fill: 'bg-amber-900/30 text-amber-400',
    collect: 'bg-purple-900/30 text-purple-400',
  }

  return (
    <div className="space-y-4">
      {/* サブタブ */}
      <div className="flex gap-2">
        <button
          onClick={() => setSubTab('log')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            subTab === 'log' ? 'bg-[#2d8a4e] text-white' : 'bg-[#121a2e] text-[#8090b0] border border-[#2a3050]'
          }`}
        >
          取引一覧
        </button>
        <button
          onClick={() => setSubTab('new')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${
            subTab === 'new' ? 'bg-[#2d8a4e] text-white' : 'bg-[#121a2e] text-[#8090b0] border border-[#2a3050]'
          }`}
        >
          <Plus size={14} /> 新規取引
        </button>
      </div>

      {subTab === 'new' ? (
        <NewTransactionForm onComplete={() => setSubTab('log')} />
      ) : (
        <>
          {/* フィルター + CSV出力 */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {(['all', 'purchase', 'return', 'fill', 'collect'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    filterType === type
                      ? 'bg-[#2d8a4e] text-white'
                      : 'bg-[#121a2e] text-[#8090b0] border border-[#2a3050]'
                  }`}
                >
                  {type === 'all' ? '全て' : typeLabels[type]}
                </button>
              ))}
            </div>
            <button
              onClick={() => exportTransactionsCSV(state.transactions, state.denominations)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-[#121a2e] text-[#8090b0] border border-[#2a3050] hover:text-white"
            >
              <Download size={14} /> CSV
            </button>
          </div>

          {/* 取引一覧 */}
          <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] divide-y divide-[#2a3050]">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#8090b0]">取引がありません</div>
            ) : (
              filtered.map(tx => (
                <div key={tx.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${typeColors[tx.type]}`}>
                          {typeLabels[tx.type]}
                        </span>
                        <span className="text-xs text-[#8090b0]">
                          {new Date(tx.createdAt).toLocaleString('ja-JP', {
                            month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                        {tx.staffName && (
                          <span className="text-xs text-[#8090b0]">({tx.staffName})</span>
                        )}
                      </div>
                      {/* チップ内訳 */}
                      <div className="flex gap-2 flex-wrap">
                        {tx.chips.map(c => {
                          const d = state.denominations.find(d => d.id === c.denominationId)
                          return d ? (
                            <span key={c.denominationId} className="text-xs text-[#8090b0]">
                              <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: d.color }} />
                              {d.label} × {c.count}
                            </span>
                          ) : null
                        })}
                      </div>
                      {tx.note && <div className="text-xs text-[#8090b0]">{tx.note}</div>}
                    </div>
                    {tx.cashAmount != null && (
                      <div className="text-lg font-bold text-[#c9a456]">
                        ¥{tx.cashAmount.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

function NewTransactionForm({ onComplete }: { onComplete: () => void }) {
  const { state, dispatch } = useApp()
  const [txType, setTxType] = useState<ChipTransactionType>('purchase')
  const [tableId, setTableId] = useState('')
  const [cashAmount, setCashAmount] = useState('')
  const [staffName, setStaffName] = useState('')
  const [note, setNote] = useState('')
  const [chips, setChips] = useState<Record<string, number>>(
    Object.fromEntries(state.denominations.map(d => [d.id, 0]))
  )

  const needsTable = txType === 'fill' || txType === 'collect'
  const needsCash = txType === 'purchase'

  const chipTotal = state.denominations.reduce(
    (sum, d) => sum + d.value * (chips[d.id] || 0), 0
  )

  const handleSubmit = () => {
    const chipBreakdown: ChipBreakdown[] = state.denominations
      .filter(d => (chips[d.id] || 0) > 0)
      .map(d => ({ denominationId: d.id, count: chips[d.id] }))

    if (chipBreakdown.length === 0) return

    dispatch({
      type: 'ADD_TRANSACTION',
      transaction: {
        id: generateId(),
        type: txType,
        tableId: needsTable ? tableId : undefined,
        cashAmount: needsCash ? Number(cashAmount) : undefined,
        chips: chipBreakdown,
        staffName: staffName || undefined,
        note: note || undefined,
        createdAt: new Date().toISOString(),
      },
    })

    onComplete()
  }

  const typeOptions: { value: ChipTransactionType; label: string; icon: typeof Plus }[] = [
    { value: 'purchase', label: 'チップ購入', icon: Plus },
    { value: 'return', label: 'チップ返却', icon: RotateCcw },
    { value: 'fill', label: 'フロート補充', icon: ArrowDownToLine },
    { value: 'collect', label: 'チップ回収', icon: ArrowUpFromLine },
  ]

  return (
    <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] p-4 space-y-4">
      <h3 className="font-bold">新規取引</h3>

      {/* 取引種別 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {typeOptions.map(opt => {
          const Icon = opt.icon
          return (
            <button
              key={opt.value}
              onClick={() => setTxType(opt.value)}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border ${
                txType === opt.value
                  ? 'border-[#2d8a4e] bg-[#2d8a4e]/20 text-[#2d8a4e]'
                  : 'border-[#2a3050] text-[#8090b0] hover:text-white'
              }`}
            >
              <Icon size={14} />
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* テーブル選択（fill/collect時） */}
      {needsTable && (
        <div>
          <label className="text-xs text-[#8090b0] mb-1 block">テーブル</label>
          <select
            value={tableId}
            onChange={e => setTableId(e.target.value)}
            className="w-full bg-[#0d1420] border border-[#2a3050] text-white rounded-lg px-3 py-2 text-sm"
          >
            <option value="">選択してください</option>
            {state.tables.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* 現金額（purchase時） */}
      {needsCash && (
        <div>
          <label className="text-xs text-[#8090b0] mb-1 block">現金額</label>
          <input
            type="number"
            value={cashAmount}
            onChange={e => setCashAmount(e.target.value)}
            placeholder="5000"
            className="w-full bg-[#0d1420] border border-[#2a3050] text-white rounded-lg px-3 py-2 text-sm"
          />
        </div>
      )}

      {/* チップ枚数入力 */}
      <div>
        <label className="text-xs text-[#8090b0] mb-2 block">チップ枚数</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {state.denominations.map(d => (
            <div key={d.id} className="rounded-lg border border-[#2a3050] bg-[#0d1420] p-2">
              <div className="flex items-center gap-1 mb-1">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs font-medium">{d.label}</span>
              </div>
              <input
                type="number"
                min="0"
                value={chips[d.id] || ''}
                onChange={e => setChips({ ...chips, [d.id]: Number(e.target.value) || 0 })}
                placeholder="0"
                className="w-full bg-transparent border-0 text-white text-lg font-bold p-0 focus:outline-none"
              />
            </div>
          ))}
        </div>
        <div className="mt-2 text-right text-sm text-[#8090b0]">
          チップ合計: <span className="text-white font-bold">¥{chipTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* スタッフ・メモ */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#8090b0] mb-1 block">スタッフ</label>
          <select
            value={staffName}
            onChange={e => setStaffName(e.target.value)}
            className="w-full bg-[#0d1420] border border-[#2a3050] text-white rounded-lg px-3 py-2 text-sm"
          >
            <option value="">選択</option>
            {state.staff.filter(s => s.isActive).map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-[#8090b0] mb-1 block">メモ</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="任意"
            className="w-full bg-[#0d1420] border border-[#2a3050] text-white rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* 送信 */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onComplete}
          className="px-4 py-2 rounded-lg text-sm bg-[#0d1420] border border-[#2a3050] text-[#8090b0]"
        >
          キャンセル
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 rounded-lg text-sm bg-[#2d8a4e] text-white font-medium"
        >
          記録する
        </button>
      </div>
    </div>
  )
}
