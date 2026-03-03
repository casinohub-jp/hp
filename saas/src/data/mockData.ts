import type { ChipDenomination, Table, Staff, ChipTransaction, DailySales } from '../types'

export const initialDenominations: ChipDenomination[] = [
  { id: 'denom-100', value: 100, color: '#e0e0e0', label: '¥100' },
  { id: 'denom-500', value: 500, color: '#e53935', label: '¥500' },
  { id: 'denom-1000', value: 1000, color: '#1e88e5', label: '¥1,000' },
  { id: 'denom-5000', value: 5000, color: '#2d8a4e', label: '¥5,000' },
  { id: 'denom-10000', value: 10000, color: '#c9a456', label: '¥10,000' },
]

export const initialTables: Table[] = [
  { id: 'table-1', name: 'テーブル1', gameType: 'holdem', isOpen: false },
  { id: 'table-2', name: 'テーブル2', gameType: 'holdem', isOpen: false },
  { id: 'table-3', name: 'テーブル3', gameType: 'holdem', isOpen: false },
  { id: 'table-4', name: 'テーブル4', gameType: 'blackjack', isOpen: false },
  { id: 'table-5', name: 'テーブル5', gameType: 'baccarat', isOpen: false },
]

export const initialStaff: Staff[] = [
  { id: 'staff-1', name: '田中', role: 'manager', isActive: true },
  { id: 'staff-2', name: '鈴木', role: 'dealer', isActive: true },
  { id: 'staff-3', name: '佐藤', role: 'dealer', isActive: true },
  { id: 'staff-4', name: '高橋', role: 'floor', isActive: true },
]

// サンプル取引データ
const today = new Date().toISOString().split('T')[0]

export const initialTransactions: ChipTransaction[] = [
  {
    id: 'tx-1',
    type: 'fill',
    tableId: 'table-1',
    chips: [
      { denominationId: 'denom-100', count: 100 },
      { denominationId: 'denom-500', count: 40 },
      { denominationId: 'denom-1000', count: 20 },
      { denominationId: 'denom-5000', count: 4 },
    ],
    staffName: '田中',
    note: '開店フロート',
    createdAt: `${today}T15:00:00.000Z`,
  },
  {
    id: 'tx-2',
    type: 'purchase',
    cashAmount: 5000,
    chips: [
      { denominationId: 'denom-100', count: 10 },
      { denominationId: 'denom-500', count: 4 },
      { denominationId: 'denom-1000', count: 2 },
    ],
    staffName: '高橋',
    createdAt: `${today}T16:30:00.000Z`,
  },
  {
    id: 'tx-3',
    type: 'purchase',
    cashAmount: 10000,
    chips: [
      { denominationId: 'denom-1000', count: 5 },
      { denominationId: 'denom-5000', count: 1 },
    ],
    staffName: '高橋',
    createdAt: `${today}T17:15:00.000Z`,
  },
  {
    id: 'tx-4',
    type: 'return',
    chips: [
      { denominationId: 'denom-100', count: 5 },
      { denominationId: 'denom-500', count: 2 },
      { denominationId: 'denom-1000', count: 1 },
    ],
    staffName: '高橋',
    createdAt: `${today}T19:00:00.000Z`,
  },
]

export const initialDailySales: DailySales[] = [
  {
    date: today,
    chipSales: 15000,
    drinkSales: 8500,
    tournamentSales: 0,
    otherSales: 0,
    totalSales: 23500,
  },
]

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36)
}
