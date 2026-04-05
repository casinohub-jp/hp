import { supabase, getTenantId } from './supabase'
import type {
  ChipDenomination, Table, Staff, ChipTransaction,
  InventoryRecord, DailySales, Tournament, TournamentEntry,
  AppState, GameType, StaffRole, ChipTransactionType, TournamentStatus,
} from '../types'

// tenant_idを取得するヘルパー（未設定時はエラー）
function requireTenantId(): string {
  const tenantId = getTenantId()
  if (!tenantId) throw new Error('tenant_idが設定されていません。ログインしてください。')
  return tenantId
}

// --- 変換ヘルパー ---

function toChipDenomination(row: Record<string, unknown>): ChipDenomination {
  return {
    id: row.id as string,
    value: row.value as number,
    color: row.color as string,
    label: row.label as string,
  }
}

function toTable(row: Record<string, unknown>): Table {
  return {
    id: row.id as string,
    name: row.name as string,
    gameType: row.game_type as GameType,
    isOpen: row.is_open as boolean,
  }
}

function toStaff(row: Record<string, unknown>): Staff {
  return {
    id: row.id as string,
    name: row.name as string,
    role: row.role as StaffRole,
    isActive: row.is_active as boolean,
  }
}

function toDailySales(row: Record<string, unknown>): DailySales {
  return {
    date: row.date as string,
    chipSales: row.chip_sales as number,
    drinkSales: row.drink_sales as number,
    tournamentSales: row.tournament_sales as number,
    otherSales: row.other_sales as number,
    totalSales: row.total_sales as number,
  }
}

function toTournamentEntry(row: Record<string, unknown>): TournamentEntry {
  return {
    id: row.id as string,
    playerName: row.player_name as string,
    tableId: row.table_id as string | undefined,
    seatNumber: row.seat_number as number | undefined,
    rebuys: row.rebuys as number,
    addons: row.addons as number,
    enteredAt: row.entered_at as string,
    eliminatedAt: row.eliminated_at as string | undefined,
    finishPosition: row.finish_position as number | undefined,
    prizeAmount: row.prize_amount as number | undefined,
  }
}

function toTournament(row: Record<string, unknown>, entries: TournamentEntry[]): Tournament {
  return {
    id: row.id as string,
    name: row.name as string,
    date: row.date as string,
    status: row.status as TournamentStatus,
    entryFee: row.entry_fee as number,
    rebuyFee: row.rebuy_fee as number,
    addonFee: row.addon_fee as number,
    startingChips: row.starting_chips as number,
    maxPlayers: row.max_players as number,
    blindStructure: (row.blind_structure as Tournament['blindStructure']) || [],
    currentLevel: row.current_level as number,
    levelStartedAt: row.level_started_at as string | undefined,
    entries,
    prizeStructure: (row.prize_structure as Tournament['prizeStructure']) || [],
    note: row.note as string | undefined,
    createdAt: row.created_at as string,
  }
}

// --- Fetch ---

export async function fetchAppState(): Promise<AppState> {
  const tenantId = requireTenantId()

  const [denomRes, tablesRes, staffRes, txRes, salesRes, tournamentsRes] = await Promise.all([
    supabase.from('denominations').select('*').eq('tenant_id', tenantId).order('value'),
    supabase.from('tables').select('*').eq('tenant_id', tenantId).order('name'),
    supabase.from('staff').select('*').eq('tenant_id', tenantId).order('name'),
    supabase.from('chip_transactions').select('*, chip_transaction_items(*)').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
    supabase.from('daily_sales').select('*').eq('tenant_id', tenantId).order('date', { ascending: false }),
    supabase.from('tournaments').select('*, tournament_entries(*)').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
  ])

  const denominations = (denomRes.data || []).map(toChipDenomination)
  const tables = (tablesRes.data || []).map(toTable)
  const staff = (staffRes.data || []).map(toStaff)

  const transactions: ChipTransaction[] = (txRes.data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    type: row.type as ChipTransactionType,
    tableId: row.table_id as string | undefined,
    cashAmount: row.cash_amount as number | undefined,
    chips: ((row.chip_transaction_items as Record<string, unknown>[]) || []).map(item => ({
      denominationId: item.denomination_id as string,
      count: item.count as number,
    })),
    staffName: row.staff_name as string | undefined,
    note: row.note as string | undefined,
    createdAt: row.created_at as string,
  }))

  const dailySales = (salesRes.data || []).map(toDailySales)

  const tournaments: Tournament[] = (tournamentsRes.data || []).map((row: Record<string, unknown>) => {
    const entries = ((row.tournament_entries as Record<string, unknown>[]) || []).map(toTournamentEntry)
    return toTournament(row, entries)
  })

  return { denominations, tables, staff, transactions, inventoryRecords: [], dailySales, tournaments }
}

// --- Mutations ---

export async function insertDenomination(d: ChipDenomination) {
  const tenantId = requireTenantId()
  const { error } = await supabase.from('denominations').insert({
    id: d.id, tenant_id: tenantId, value: d.value, color: d.color, label: d.label,
  })
  if (error) throw error
}

export async function updateDenomination(d: ChipDenomination) {
  const { error } = await supabase.from('denominations').update({
    value: d.value, color: d.color, label: d.label,
  }).eq('id', d.id)
  if (error) throw error
}

export async function insertTable(t: Table) {
  const tenantId = requireTenantId()
  const { error } = await supabase.from('tables').insert({
    id: t.id, tenant_id: tenantId, name: t.name, game_type: t.gameType, is_open: t.isOpen,
  })
  if (error) throw error
}

export async function updateTable(t: Table) {
  const { error } = await supabase.from('tables').update({
    name: t.name, game_type: t.gameType, is_open: t.isOpen,
  }).eq('id', t.id)
  if (error) throw error
}

export async function toggleTable(id: string, currentIsOpen: boolean) {
  const { error } = await supabase.from('tables').update({ is_open: !currentIsOpen }).eq('id', id)
  if (error) throw error
}

export async function insertStaff(s: Staff) {
  const tenantId = requireTenantId()
  const { error } = await supabase.from('staff').insert({
    id: s.id, tenant_id: tenantId, name: s.name, role: s.role, is_active: s.isActive,
  })
  if (error) throw error
}

export async function updateStaff(s: Staff) {
  const { error } = await supabase.from('staff').update({
    name: s.name, role: s.role, is_active: s.isActive,
  }).eq('id', s.id)
  if (error) throw error
}

export async function insertTransaction(tx: ChipTransaction) {
  const tenantId = requireTenantId()
  const { error: txError } = await supabase.from('chip_transactions').insert({
    id: tx.id, tenant_id: tenantId, type: tx.type, table_id: tx.tableId || null,
    cash_amount: tx.cashAmount || null, staff_name: tx.staffName || null, note: tx.note || null,
    created_at: tx.createdAt,
  })
  if (txError) throw txError

  if (tx.chips.length > 0) {
    const items = tx.chips.map(c => ({
      transaction_id: tx.id,
      denomination_id: c.denominationId,
      count: c.count,
    }))
    const { error: itemsError } = await supabase.from('chip_transaction_items').insert(items)
    if (itemsError) throw itemsError
  }
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('chip_transactions').delete().eq('id', id)
  if (error) throw error
}

export async function upsertDailySales(sales: DailySales) {
  const tenantId = requireTenantId()
  const { error } = await supabase.from('daily_sales').upsert({
    tenant_id: tenantId,
    date: sales.date,
    chip_sales: sales.chipSales,
    drink_sales: sales.drinkSales,
    tournament_sales: sales.tournamentSales,
    other_sales: sales.otherSales,
    total_sales: sales.totalSales,
  }, { onConflict: 'tenant_id,date' })
  if (error) throw error
}

export async function insertTournament(t: Tournament) {
  const tenantId = requireTenantId()
  const { error: tError } = await supabase.from('tournaments').insert({
    id: t.id, tenant_id: tenantId, name: t.name, date: t.date, status: t.status,
    entry_fee: t.entryFee, rebuy_fee: t.rebuyFee, addon_fee: t.addonFee,
    starting_chips: t.startingChips, max_players: t.maxPlayers,
    blind_structure: t.blindStructure, current_level: t.currentLevel,
    level_started_at: t.levelStartedAt || null,
    prize_structure: t.prizeStructure, note: t.note || null,
    created_at: t.createdAt,
  })
  if (tError) throw tError

  if (t.entries.length > 0) {
    const entries = t.entries.map(e => ({
      id: e.id, tournament_id: t.id, player_name: e.playerName,
      table_id: e.tableId || null, seat_number: e.seatNumber || null,
      rebuys: e.rebuys, addons: e.addons, entered_at: e.enteredAt,
      eliminated_at: e.eliminatedAt || null,
      finish_position: e.finishPosition || null, prize_amount: e.prizeAmount || null,
    }))
    const { error: eError } = await supabase.from('tournament_entries').insert(entries)
    if (eError) throw eError
  }
}

export async function updateTournament(t: Tournament) {
  const { error: tError } = await supabase.from('tournaments').update({
    name: t.name, date: t.date, status: t.status,
    entry_fee: t.entryFee, rebuy_fee: t.rebuyFee, addon_fee: t.addonFee,
    starting_chips: t.startingChips, max_players: t.maxPlayers,
    blind_structure: t.blindStructure, current_level: t.currentLevel,
    level_started_at: t.levelStartedAt || null,
    prize_structure: t.prizeStructure, note: t.note || null,
  }).eq('id', t.id)
  if (tError) throw tError

  // entries: 削除して再挿入（シンプルなアプローチ）
  await supabase.from('tournament_entries').delete().eq('tournament_id', t.id)
  if (t.entries.length > 0) {
    const entries = t.entries.map(e => ({
      id: e.id, tournament_id: t.id, player_name: e.playerName,
      table_id: e.tableId || null, seat_number: e.seatNumber || null,
      rebuys: e.rebuys, addons: e.addons, entered_at: e.enteredAt,
      eliminated_at: e.eliminatedAt || null,
      finish_position: e.finishPosition || null, prize_amount: e.prizeAmount || null,
    }))
    const { error: eError } = await supabase.from('tournament_entries').insert(entries)
    if (eError) throw eError
  }
}

export async function deleteTournament(id: string) {
  const { error } = await supabase.from('tournaments').delete().eq('id', id)
  if (error) throw error
}

export async function insertInventoryRecord(record: InventoryRecord) {
  const tenantId = requireTenantId()
  const { error: rError } = await supabase.from('inventory_records').insert({
    id: record.id, tenant_id: tenantId, date: record.date,
    expected_total: record.expectedTotal, actual_total: record.actualTotal,
    difference: record.difference, note: record.note || null,
    created_at: record.createdAt,
  })
  if (rError) throw rError

  if (record.vaultCounts.length > 0) {
    const vaultItems = record.vaultCounts.map(c => ({
      record_id: record.id, denomination_id: c.denominationId, count: c.count,
    }))
    const { error } = await supabase.from('inventory_vault_counts').insert(vaultItems)
    if (error) throw error
  }

  for (const tc of record.tableCounts) {
    if (tc.counts.length > 0) {
      const tableItems = tc.counts.map(c => ({
        record_id: record.id, table_id: tc.tableId, denomination_id: c.denominationId, count: c.count,
      }))
      const { error } = await supabase.from('inventory_table_counts').insert(tableItems)
      if (error) throw error
    }
  }
}
