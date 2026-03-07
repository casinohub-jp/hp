-- =====================================================
-- Casinohub インデックス設計
-- 2026-03-07
-- =====================================================

-- 各テーブルの tenant_id インデックス
CREATE INDEX IF NOT EXISTS idx_denominations_tenant_id ON denominations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tables_tenant_id ON tables(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_tenant_id ON staff(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chip_transactions_tenant_id ON chip_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_daily_sales_tenant_id ON daily_sales(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_tenant_id ON tournaments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_records_tenant_id ON inventory_records(tenant_id);

-- tournaments: tenant_id + status 複合インデックス（アクティブトーナメント検索用）
CREATE INDEX IF NOT EXISTS idx_tournaments_tenant_status ON tournaments(tenant_id, status);

-- tournament_entries: tournament_id インデックス
CREATE INDEX IF NOT EXISTS idx_tournament_entries_tournament_id ON tournament_entries(tournament_id);

-- chip_transaction_items: transaction_id インデックス
CREATE INDEX IF NOT EXISTS idx_chip_transaction_items_transaction_id ON chip_transaction_items(transaction_id);

-- chip_transactions: tenant_id + created_at 複合（時系列クエリ用）
CREATE INDEX IF NOT EXISTS idx_chip_transactions_tenant_created ON chip_transactions(tenant_id, created_at DESC);

-- daily_sales: tenant_id + date 複合（日次レポート用）
CREATE INDEX IF NOT EXISTS idx_daily_sales_tenant_date ON daily_sales(tenant_id, date DESC);

-- tournaments: tenant_id + created_at 複合（一覧ソート用）
CREATE INDEX IF NOT EXISTS idx_tournaments_tenant_created ON tournaments(tenant_id, created_at DESC);

-- inventory_records: tenant_id + date 複合（棚卸し履歴用）
CREATE INDEX IF NOT EXISTS idx_inventory_records_tenant_date ON inventory_records(tenant_id, date DESC);
