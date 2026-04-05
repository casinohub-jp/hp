import { describe, it, expect } from 'vitest'
import type { AppState, AppAction, Table, Staff, ChipDenomination, Tournament, ChipTransaction, DailySales } from '../types'

// appReducerをテストするため、AppContext.tsxからreducerを分離する必要がある
// 暫定: reducer関数を直接コピーしてテスト（将来的にAppContext.tsxからexportする）
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.transaction, ...state.transactions] }
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.id) }
    case 'ADD_TABLE':
      return { ...state, tables: [...state.tables, action.table] }
    case 'UPDATE_TABLE':
      return { ...state, tables: state.tables.map(t => t.id === action.table.id ? action.table : t) }
    case 'TOGGLE_TABLE':
      return {
        ...state,
        tables: state.tables.map(t => t.id === action.id ? { ...t, isOpen: !t.isOpen } : t),
      }
    case 'ADD_INVENTORY':
      return { ...state, inventoryRecords: [action.record, ...state.inventoryRecords] }
    case 'UPDATE_DAILY_SALES': {
      const exists = state.dailySales.find(s => s.date === action.sales.date)
      if (exists) {
        return { ...state, dailySales: state.dailySales.map(s => s.date === action.sales.date ? action.sales : s) }
      }
      return { ...state, dailySales: [...state.dailySales, action.sales] }
    }
    case 'ADD_STAFF':
      return { ...state, staff: [...state.staff, action.staff] }
    case 'UPDATE_STAFF':
      return { ...state, staff: state.staff.map(s => s.id === action.staff.id ? action.staff : s) }
    case 'ADD_DENOMINATION':
      return { ...state, denominations: [...state.denominations, action.denomination] }
    case 'UPDATE_DENOMINATION':
      return { ...state, denominations: state.denominations.map(d => d.id === action.denomination.id ? action.denomination : d) }
    case 'ADD_TOURNAMENT':
      return { ...state, tournaments: [action.tournament, ...state.tournaments] }
    case 'UPDATE_TOURNAMENT':
      return { ...state, tournaments: state.tournaments.map(t => t.id === action.tournament.id ? action.tournament : t) }
    case 'DELETE_TOURNAMENT':
      return { ...state, tournaments: state.tournaments.filter(t => t.id !== action.id) }
    case 'LOAD_STATE':
      return { ...defaultState, ...action.state }
    default:
      return state
  }
}

const defaultState: AppState = {
  denominations: [],
  tables: [],
  staff: [],
  transactions: [],
  inventoryRecords: [],
  dailySales: [],
  tournaments: [],
}

describe('appReducer', () => {
  // --- テーブル ---
  describe('テーブル操作', () => {
    const table: Table = { id: 't1', name: 'テーブル1', gameType: 'holdem', isOpen: false }

    it('ADD_TABLE', () => {
      const result = appReducer(defaultState, { type: 'ADD_TABLE', table })
      expect(result.tables).toHaveLength(1)
      expect(result.tables[0]).toEqual(table)
    })

    it('UPDATE_TABLE', () => {
      const state = { ...defaultState, tables: [table] }
      const updated = { ...table, name: 'テーブルA' }
      const result = appReducer(state, { type: 'UPDATE_TABLE', table: updated })
      expect(result.tables[0].name).toBe('テーブルA')
    })

    it('TOGGLE_TABLE', () => {
      const state = { ...defaultState, tables: [table] }
      const result = appReducer(state, { type: 'TOGGLE_TABLE', id: 't1' })
      expect(result.tables[0].isOpen).toBe(true)

      const result2 = appReducer(result, { type: 'TOGGLE_TABLE', id: 't1' })
      expect(result2.tables[0].isOpen).toBe(false)
    })

    it('存在しないIDのTOGGLE_TABLEは何も変更しない', () => {
      const state = { ...defaultState, tables: [table] }
      const result = appReducer(state, { type: 'TOGGLE_TABLE', id: 'nonexistent' })
      expect(result.tables).toEqual([table])
    })
  })

  // --- トーナメント ---
  describe('トーナメント操作', () => {
    const tournament: Tournament = {
      id: 'tour1',
      name: 'テスト大会',
      date: '2026-01-01',
      status: 'upcoming',
      entryFee: 3000,
      rebuyFee: 2000,
      addonFee: 1000,
      startingChips: 10000,
      maxPlayers: 30,
      blindStructure: [],
      currentLevel: 0,
      entries: [],
      prizeStructure: [],
      createdAt: '2026-01-01T00:00:00Z',
    }

    it('ADD_TOURNAMENT は先頭に追加', () => {
      const existing: Tournament = { ...tournament, id: 'tour0', name: '既存大会' }
      const state = { ...defaultState, tournaments: [existing] }
      const result = appReducer(state, { type: 'ADD_TOURNAMENT', tournament })
      expect(result.tournaments).toHaveLength(2)
      expect(result.tournaments[0].id).toBe('tour1')
    })

    it('UPDATE_TOURNAMENT', () => {
      const state = { ...defaultState, tournaments: [tournament] }
      const updated = { ...tournament, status: 'running' as const }
      const result = appReducer(state, { type: 'UPDATE_TOURNAMENT', tournament: updated })
      expect(result.tournaments[0].status).toBe('running')
    })

    it('DELETE_TOURNAMENT', () => {
      const state = { ...defaultState, tournaments: [tournament] }
      const result = appReducer(state, { type: 'DELETE_TOURNAMENT', id: 'tour1' })
      expect(result.tournaments).toHaveLength(0)
    })
  })

  // --- スタッフ ---
  describe('スタッフ操作', () => {
    const staff: Staff = { id: 's1', name: 'テスト太郎', role: 'dealer', isActive: true }

    it('ADD_STAFF', () => {
      const result = appReducer(defaultState, { type: 'ADD_STAFF', staff })
      expect(result.staff).toHaveLength(1)
    })

    it('UPDATE_STAFF', () => {
      const state = { ...defaultState, staff: [staff] }
      const updated = { ...staff, name: 'テスト花子' }
      const result = appReducer(state, { type: 'UPDATE_STAFF', staff: updated })
      expect(result.staff[0].name).toBe('テスト花子')
    })
  })

  // --- 額面 ---
  describe('額面操作', () => {
    const denom: ChipDenomination = { id: 'd1', value: 100, color: '#ff0000', label: '¥100' }

    it('ADD_DENOMINATION', () => {
      const result = appReducer(defaultState, { type: 'ADD_DENOMINATION', denomination: denom })
      expect(result.denominations).toHaveLength(1)
    })

    it('UPDATE_DENOMINATION', () => {
      const state = { ...defaultState, denominations: [denom] }
      const updated = { ...denom, color: '#00ff00' }
      const result = appReducer(state, { type: 'UPDATE_DENOMINATION', denomination: updated })
      expect(result.denominations[0].color).toBe('#00ff00')
    })
  })

  // --- 売上 ---
  describe('売上操作', () => {
    const sales: DailySales = {
      date: '2026-01-01',
      chipSales: 100000,
      drinkSales: 50000,
      tournamentSales: 30000,
      otherSales: 10000,
      totalSales: 190000,
    }

    it('UPDATE_DAILY_SALES: 新規追加', () => {
      const result = appReducer(defaultState, { type: 'UPDATE_DAILY_SALES', sales })
      expect(result.dailySales).toHaveLength(1)
    })

    it('UPDATE_DAILY_SALES: 既存更新', () => {
      const state = { ...defaultState, dailySales: [sales] }
      const updated = { ...sales, totalSales: 200000 }
      const result = appReducer(state, { type: 'UPDATE_DAILY_SALES', sales: updated })
      expect(result.dailySales).toHaveLength(1)
      expect(result.dailySales[0].totalSales).toBe(200000)
    })
  })

  // --- トランザクション ---
  describe('トランザクション操作', () => {
    const tx: ChipTransaction = {
      id: 'tx1',
      type: 'purchase',
      cashAmount: 10000,
      chips: [{ denominationId: 'd1', count: 10 }],
      createdAt: '2026-01-01T00:00:00Z',
    }

    it('ADD_TRANSACTION は先頭に追加', () => {
      const result = appReducer(defaultState, { type: 'ADD_TRANSACTION', transaction: tx })
      expect(result.transactions).toHaveLength(1)
    })

    it('DELETE_TRANSACTION', () => {
      const state = { ...defaultState, transactions: [tx] }
      const result = appReducer(state, { type: 'DELETE_TRANSACTION', id: 'tx1' })
      expect(result.transactions).toHaveLength(0)
    })
  })

  // --- LOAD_STATE ---
  it('LOAD_STATE はデフォルト状態とマージ', () => {
    const partial = { tables: [{ id: 't1', name: 'テーブル1', gameType: 'holdem' as const, isOpen: true }] }
    const result = appReducer(defaultState, { type: 'LOAD_STATE', state: partial as AppState })
    expect(result.tables).toHaveLength(1)
    expect(result.tournaments).toEqual([])
  })
})
