import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { AppState, AppAction } from '../types'
import {
  initialDenominations,
  initialTables,
  initialStaff,
  initialTransactions,
  initialDailySales,
} from '../data/mockData'

const STORAGE_KEY = 'casinohub_app_state'

const defaultState: AppState = {
  denominations: initialDenominations,
  tables: initialTables,
  staff: initialStaff,
  transactions: initialTransactions,
  inventoryRecords: [],
  dailySales: initialDailySales,
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

    // 状態復元
    case 'LOAD_STATE':
      return action.state

    default:
      return state
  }
}

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved) as AppState
    }
  } catch {
    // 読み込み失敗時はデフォルト
  }
  return defaultState
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState)

  // localStorage に保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // 他タブとの同期
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        dispatch({ type: 'LOAD_STATE', state: JSON.parse(e.newValue) })
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
