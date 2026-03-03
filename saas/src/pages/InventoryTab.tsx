import { useState } from 'react'
import { ClipboardCheck, AlertTriangle, CheckCircle } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { generateId } from '../data/mockData'
import type { ChipBreakdown } from '../types'

export default function InventoryTab() {
  const { state, dispatch } = useApp()
  const [isCountMode, setIsCountMode] = useState(false)
  const [vaultCounts, setVaultCounts] = useState<Record<string, number>>(
    Object.fromEntries(state.denominations.map(d => [d.id, 0]))
  )
  const [tableCounts, setTableCounts] = useState<Record<string, Record<string, number>>>(
    Object.fromEntries(
      state.tables.map(t => [t.id, Object.fromEntries(state.denominations.map(d => [d.id, 0]))])
    )
  )
  const [note, setNote] = useState('')

  // システム上の期待チップ残高を計算
  const calcExpectedTotal = (): number => {
    let total = 0
    for (const tx of state.transactions) {
      const chipValue = tx.chips.reduce((sum, c) => {
        const d = state.denominations.find(d => d.id === c.denominationId)
        return sum + (d ? d.value * c.count : 0)
      }, 0)

      // purchase/fill は店にチップが入る, return/collect も店にチップが戻る
      // 実際には全て「店のチップ在庫」として扱う
      if (tx.type === 'purchase' || tx.type === 'return') {
        total += chipValue
      }
    }
    return total
  }

  const calcActualTotal = (): number => {
    let total = 0
    // 保管庫
    for (const d of state.denominations) {
      total += d.value * (vaultCounts[d.id] || 0)
    }
    // テーブル
    for (const t of state.tables) {
      for (const d of state.denominations) {
        total += d.value * (tableCounts[t.id]?.[d.id] || 0)
      }
    }
    return total
  }

  const handleSubmit = () => {
    const vaultBreakdown: ChipBreakdown[] = state.denominations
      .map(d => ({ denominationId: d.id, count: vaultCounts[d.id] || 0 }))

    const tableBreakdowns = state.tables.map(t => ({
      tableId: t.id,
      counts: state.denominations.map(d => ({
        denominationId: d.id,
        count: tableCounts[t.id]?.[d.id] || 0,
      })),
    }))

    const expectedTotal = calcExpectedTotal()
    const actualTotal = calcActualTotal()

    dispatch({
      type: 'ADD_INVENTORY',
      record: {
        id: generateId(),
        date: new Date().toISOString().split('T')[0],
        vaultCounts: vaultBreakdown,
        tableCounts: tableBreakdowns,
        expectedTotal,
        actualTotal,
        difference: actualTotal - expectedTotal,
        note: note || undefined,
        createdAt: new Date().toISOString(),
      },
    })

    setIsCountMode(false)
  }

  return (
    <div className="space-y-4">
      {isCountMode ? (
        // 棚卸しカウント画面
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">棚卸しカウント</h2>
            <span className="text-xs text-[#8090b0]">{new Date().toLocaleDateString('ja-JP')}</span>
          </div>

          {/* 保管庫 */}
          <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] p-4">
            <h3 className="text-sm font-bold text-[#c9a456] mb-3">保管庫（金庫）</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {state.denominations.map(d => (
                <div key={d.id} className="rounded-lg border border-[#2a3050] bg-[#0d1420] p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-xs">{d.label}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={vaultCounts[d.id] || ''}
                    onChange={e => setVaultCounts({ ...vaultCounts, [d.id]: Number(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full bg-transparent text-white text-lg font-bold focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* テーブルごと */}
          {state.tables.map(table => (
            <div key={table.id} className="rounded-xl border border-[#2a3050] bg-[#121a2e] p-4">
              <h3 className="text-sm font-bold text-[#8090b0] mb-3">{table.name}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {state.denominations.map(d => (
                  <div key={d.id} className="rounded-lg border border-[#2a3050] bg-[#0d1420] p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-xs">{d.label}</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={tableCounts[table.id]?.[d.id] || ''}
                      onChange={e => {
                        const newTableCounts = { ...tableCounts }
                        if (!newTableCounts[table.id]) {
                          newTableCounts[table.id] = Object.fromEntries(state.denominations.map(dd => [dd.id, 0]))
                        }
                        newTableCounts[table.id] = { ...newTableCounts[table.id], [d.id]: Number(e.target.value) || 0 }
                        setTableCounts(newTableCounts)
                      }}
                      placeholder="0"
                      className="w-full bg-transparent text-white text-lg font-bold focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* 合計・差異 */}
          <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#8090b0]">カウント合計</span>
              <span className="text-xl font-bold">¥{calcActualTotal().toLocaleString()}</span>
            </div>
            <div>
              <label className="text-xs text-[#8090b0] mb-1 block">備考</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="差異の原因等"
                className="w-full bg-[#0d1420] border border-[#2a3050] text-white rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsCountMode(false)}
              className="px-4 py-2 rounded-lg text-sm bg-[#0d1420] border border-[#2a3050] text-[#8090b0]"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 rounded-lg text-sm bg-[#2d8a4e] text-white font-medium"
            >
              棚卸しを確定
            </button>
          </div>
        </div>
      ) : (
        // 棚卸し履歴
        <>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">棚卸し</h2>
            <button
              onClick={() => setIsCountMode(true)}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm bg-[#2d8a4e] text-white font-medium"
            >
              <ClipboardCheck size={14} /> 棚卸し開始
            </button>
          </div>

          {state.inventoryRecords.length === 0 ? (
            <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] p-8 text-center text-sm text-[#8090b0]">
              棚卸し記録がありません
            </div>
          ) : (
            <div className="space-y-3">
              {state.inventoryRecords.map(record => (
                <div key={record.id} className="rounded-xl border border-[#2a3050] bg-[#121a2e] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{record.date}</span>
                      <span className="text-xs text-[#8090b0]">
                        {new Date(record.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {record.difference === 0 ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle size={14} /> 差異なし
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-amber-400">
                        <AlertTriangle size={14} /> 差異 ¥{record.difference.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-[#8090b0]">カウント合計</span>
                      <div className="font-bold">¥{record.actualTotal.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-xs text-[#8090b0]">システム残高</span>
                      <div className="font-bold">¥{record.expectedTotal.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-xs text-[#8090b0]">差異</span>
                      <div className={`font-bold ${record.difference === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {record.difference >= 0 ? '+' : ''}¥{record.difference.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {record.note && (
                    <div className="mt-2 text-xs text-[#8090b0]">{record.note}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
