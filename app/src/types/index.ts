// チップの額面
export interface ChipDenomination {
  id: string
  value: number      // 100, 500, 1000, 5000, 10000
  color: string      // 表示用カラーコード
  label: string      // "¥100", "¥500" 等
}

// チップの内訳（額面ごとの枚数）
export interface ChipBreakdown {
  denominationId: string
  count: number
}

// テーブル
export type GameType = 'holdem' | 'blackjack' | 'baccarat' | 'roulette' | 'other'

export interface Table {
  id: string
  name: string       // "テーブル1" 等
  gameType: GameType
  isOpen: boolean
}

// チップの移動記録
export type ChipTransactionType = 'purchase' | 'return' | 'fill' | 'collect'

export interface ChipTransaction {
  id: string
  type: ChipTransactionType
  // purchase: 客がチップ購入（現金→チップ）
  // return:   客がチップ返却（チップ→保管庫）
  // fill:     保管庫→テーブルへチップ補充
  // collect:  テーブル→保管庫へチップ回収
  tableId?: string           // fill/collect 時のテーブル
  cashAmount?: number        // purchase 時の現金額
  chips: ChipBreakdown[]     // 移動したチップの内訳
  staffName?: string
  note?: string
  createdAt: string          // ISO 8601
}

// 棚卸し記録
export interface InventoryRecord {
  id: string
  date: string               // YYYY-MM-DD
  // 場所ごとのカウント
  vaultCounts: ChipBreakdown[]
  tableCounts: {
    tableId: string
    counts: ChipBreakdown[]
  }[]
  // 期待値との差異
  expectedTotal: number      // システム上の合計金額
  actualTotal: number        // 実際のカウント合計金額
  difference: number         // actualTotal - expectedTotal
  note?: string
  createdAt: string
}

// 売上記録（日次）
export interface DailySales {
  date: string               // YYYY-MM-DD
  chipSales: number          // チップ購入の売上
  drinkSales: number         // ドリンク売上
  tournamentSales: number    // トーナメント参加費
  otherSales: number         // その他
  totalSales: number         // 合計
}

// スタッフ
export type StaffRole = 'dealer' | 'floor' | 'manager'

export interface Staff {
  id: string
  name: string
  role: StaffRole
  isActive: boolean
}

// アプリ全体の状態
export interface AppState {
  // マスタデータ
  denominations: ChipDenomination[]
  tables: Table[]
  staff: Staff[]
  // トランザクション
  transactions: ChipTransaction[]
  // 棚卸し
  inventoryRecords: InventoryRecord[]
  // 売上
  dailySales: DailySales[]
}

// Reducer アクション
export type AppAction =
  // チップ取引
  | { type: 'ADD_TRANSACTION'; transaction: ChipTransaction }
  | { type: 'DELETE_TRANSACTION'; id: string }
  // テーブル
  | { type: 'ADD_TABLE'; table: Table }
  | { type: 'UPDATE_TABLE'; table: Table }
  | { type: 'TOGGLE_TABLE'; id: string }
  // 棚卸し
  | { type: 'ADD_INVENTORY'; record: InventoryRecord }
  // 売上
  | { type: 'UPDATE_DAILY_SALES'; sales: DailySales }
  // スタッフ
  | { type: 'ADD_STAFF'; staff: Staff }
  | { type: 'UPDATE_STAFF'; staff: Staff }
  // 額面設定
  | { type: 'ADD_DENOMINATION'; denomination: ChipDenomination }
  | { type: 'UPDATE_DENOMINATION'; denomination: ChipDenomination }
  // 状態復元
  | { type: 'LOAD_STATE'; state: AppState }
