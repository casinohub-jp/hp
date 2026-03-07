import { createContext, useContext, useReducer, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { AppState, AppAction } from '../types'
import {
  fetchAppState,
  insertDenomination, updateDenomination,
  insertTable, updateTable, toggleTable,
  insertStaff, updateStaff,
  insertTransaction, deleteTransaction,
  insertInventoryRecord,
  upsertDailySales,
  insertTournament, updateTournament, deleteTournament,
} from '../lib/database'
import { useToast } from '../components/Toast'
import { useAuth } from './AuthContext'
import { setTenantId } from '../lib/supabase'
import { classifyError } from '../lib/errorHandler'

const defaultState: AppState = {
  denominations: [],
  tables: [],
  staff: [],
  transactions: [],
  inventoryRecords: [],
  dailySales: [],
  tournaments: [],
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // チップ取引
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.transaction, ...state.transactions] }
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.id) }

    // テーブル
    case 'ADD_TABLE':
      return { ...state, tables: [...state.tables, action.table] }
    case 'UPDATE_TABLE':
      return { ...state, tables: state.tables.map(t => t.id === action.table.id ? action.table : t) }
    case 'TOGGLE_TABLE':
      return {
        ...state,
        tables: state.tables.map(t => t.id === action.id ? { ...t, isOpen: !t.isOpen } : t),
      }

    // 棚卸し
    case 'ADD_INVENTORY':
      return { ...state, inventoryRecords: [action.record, ...state.inventoryRecords] }

    // 売上
    case 'UPDATE_DAILY_SALES': {
      const exists = state.dailySales.find(s => s.date === action.sales.date)
      if (exists) {
        return { ...state, dailySales: state.dailySales.map(s => s.date === action.sales.date ? action.sales : s) }
      }
      return { ...state, dailySales: [...state.dailySales, action.sales] }
    }

    // スタッフ
    case 'ADD_STAFF':
      return { ...state, staff: [...state.staff, action.staff] }
    case 'UPDATE_STAFF':
      return { ...state, staff: state.staff.map(s => s.id === action.staff.id ? action.staff : s) }

    // 額面
    case 'ADD_DENOMINATION':
      return { ...state, denominations: [...state.denominations, action.denomination] }
    case 'UPDATE_DENOMINATION':
      return { ...state, denominations: state.denominations.map(d => d.id === action.denomination.id ? action.denomination : d) }

    // トーナメント
    case 'ADD_TOURNAMENT':
      return { ...state, tournaments: [action.tournament, ...state.tournaments] }
    case 'UPDATE_TOURNAMENT':
      return { ...state, tournaments: state.tournaments.map(t => t.id === action.tournament.id ? action.tournament : t) }
    case 'DELETE_TOURNAMENT':
      return { ...state, tournaments: state.tournaments.filter(t => t.id !== action.id) }

    // 状態復元
    case 'LOAD_STATE':
      return { ...defaultState, ...action.state }

    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  loading: boolean
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(appReducer, defaultState)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const { tenantId } = useAuth()

  // tenant_idが変わったらSupabaseモジュールに設定してデータを再取得
  useEffect(() => {
    if (!tenantId) {
      setLoading(false)
      return
    }

    setTenantId(tenantId)
    setLoading(true)

    fetchAppState()
      .then(data => {
        rawDispatch({ type: 'LOAD_STATE', state: data })
      })
      .catch(err => {
        console.error('データ読み込みエラー:', err)
        const classified = classifyError(err)
        showToast('error', classified.message)
      })
      .finally(() => setLoading(false))
  }, [tenantId, showToast])

  // Supabaseへの同期（楽観的更新: UIは即座に反映、バックグラウンドでDB同期）
  const syncToSupabase = useCallback(async (action: AppAction, previousState: AppState) => {
    try {
      switch (action.type) {
        case 'ADD_TRANSACTION':
          await insertTransaction(action.transaction)
          break
        case 'DELETE_TRANSACTION':
          await deleteTransaction(action.id)
          break
        case 'ADD_TABLE':
          await insertTable(action.table)
          break
        case 'UPDATE_TABLE':
          await updateTable(action.table)
          break
        case 'TOGGLE_TABLE': {
          const table = previousState.tables.find(t => t.id === action.id)
          if (table) await toggleTable(action.id, table.isOpen)
          break
        }
        case 'ADD_INVENTORY':
          await insertInventoryRecord(action.record)
          break
        case 'UPDATE_DAILY_SALES':
          await upsertDailySales(action.sales)
          break
        case 'ADD_STAFF':
          await insertStaff(action.staff)
          break
        case 'UPDATE_STAFF':
          await updateStaff(action.staff)
          break
        case 'ADD_DENOMINATION':
          await insertDenomination(action.denomination)
          break
        case 'UPDATE_DENOMINATION':
          await updateDenomination(action.denomination)
          break
        case 'ADD_TOURNAMENT':
          await insertTournament(action.tournament)
          break
        case 'UPDATE_TOURNAMENT':
          await updateTournament(action.tournament)
          break
        case 'DELETE_TOURNAMENT':
          await deleteTournament(action.id)
          break
      }
    } catch (err) {
      console.error('Supabase同期エラー:', err)
      const classified = classifyError(err)
      showToast('error', classified.message)
      // 楽観的更新のロールバック: 変更前の状態を復元
      rawDispatch({ type: 'LOAD_STATE', state: previousState })
      showToast('warning', '変更を元に戻しました')
    }
  }, [showToast])

  // 楽観的更新付きdispatch（ロールバック対応）
  const dispatch = useCallback((action: AppAction) => {
    // 変更前の状態を保持してから楽観的に更新
    const previousState = state
    rawDispatch(action)
    syncToSupabase(action, previousState)
  }, [state, syncToSupabase])

  return (
    <AppContext.Provider value={{ state, dispatch, loading }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
