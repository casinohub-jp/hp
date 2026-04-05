-- =====================================================
-- Casinohub RLSポリシー + 認証用テーブル
-- 2026-03-07
-- =====================================================

-- テナントテーブル（サインアップ時に自動作成）
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ユーザーテーブル（Supabase Auth と紐付け）
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email text,
  role text NOT NULL DEFAULT 'owner', -- owner, admin, staff
  created_at timestamptz DEFAULT now()
);

-- usersテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);

-- =====================================================
-- RLS有効化
-- =====================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE denominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE chip_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chip_transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_records ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ヘルパー関数: 現在のユーザーのtenant_idを取得
-- =====================================================

CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid()
$$;

-- =====================================================
-- tenants テーブルのポリシー
-- =====================================================

CREATE POLICY "tenants_select" ON tenants
  FOR SELECT USING (id = get_my_tenant_id());

-- サインアップ時にテナントを作成できるようにする（認証済みユーザー）
CREATE POLICY "tenants_insert" ON tenants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "tenants_update" ON tenants
  FOR UPDATE USING (id = get_my_tenant_id());

-- =====================================================
-- users テーブルのポリシー
-- =====================================================

CREATE POLICY "users_select" ON users
  FOR SELECT USING (tenant_id = get_my_tenant_id());

-- サインアップ時に自分のレコードを作成できるようにする
CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "users_update" ON users
  FOR UPDATE USING (id = auth.uid() OR tenant_id = get_my_tenant_id());

-- =====================================================
-- tenant_idを持つテーブル共通ポリシー
-- =====================================================

-- denominations
CREATE POLICY "denominations_select" ON denominations
  FOR SELECT USING (tenant_id = get_my_tenant_id());
CREATE POLICY "denominations_insert" ON denominations
  FOR INSERT WITH CHECK (tenant_id = get_my_tenant_id());
CREATE POLICY "denominations_update" ON denominations
  FOR UPDATE USING (tenant_id = get_my_tenant_id());
CREATE POLICY "denominations_delete" ON denominations
  FOR DELETE USING (tenant_id = get_my_tenant_id());

-- tables
CREATE POLICY "tables_select" ON tables
  FOR SELECT USING (tenant_id = get_my_tenant_id());
CREATE POLICY "tables_insert" ON tables
  FOR INSERT WITH CHECK (tenant_id = get_my_tenant_id());
CREATE POLICY "tables_update" ON tables
  FOR UPDATE USING (tenant_id = get_my_tenant_id());
CREATE POLICY "tables_delete" ON tables
  FOR DELETE USING (tenant_id = get_my_tenant_id());

-- staff
CREATE POLICY "staff_select" ON staff
  FOR SELECT USING (tenant_id = get_my_tenant_id());
CREATE POLICY "staff_insert" ON staff
  FOR INSERT WITH CHECK (tenant_id = get_my_tenant_id());
CREATE POLICY "staff_update" ON staff
  FOR UPDATE USING (tenant_id = get_my_tenant_id());
CREATE POLICY "staff_delete" ON staff
  FOR DELETE USING (tenant_id = get_my_tenant_id());

-- chip_transactions
CREATE POLICY "chip_transactions_select" ON chip_transactions
  FOR SELECT USING (tenant_id = get_my_tenant_id());
CREATE POLICY "chip_transactions_insert" ON chip_transactions
  FOR INSERT WITH CHECK (tenant_id = get_my_tenant_id());
CREATE POLICY "chip_transactions_update" ON chip_transactions
  FOR UPDATE USING (tenant_id = get_my_tenant_id());
CREATE POLICY "chip_transactions_delete" ON chip_transactions
  FOR DELETE USING (tenant_id = get_my_tenant_id());

-- chip_transaction_items（親テーブルのtenant_id経由）
CREATE POLICY "chip_transaction_items_select" ON chip_transaction_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chip_transactions
      WHERE chip_transactions.id = chip_transaction_items.transaction_id
      AND chip_transactions.tenant_id = get_my_tenant_id()
    )
  );
CREATE POLICY "chip_transaction_items_insert" ON chip_transaction_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chip_transactions
      WHERE chip_transactions.id = chip_transaction_items.transaction_id
      AND chip_transactions.tenant_id = get_my_tenant_id()
    )
  );
CREATE POLICY "chip_transaction_items_delete" ON chip_transaction_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chip_transactions
      WHERE chip_transactions.id = chip_transaction_items.transaction_id
      AND chip_transactions.tenant_id = get_my_tenant_id()
    )
  );

-- daily_sales
CREATE POLICY "daily_sales_select" ON daily_sales
  FOR SELECT USING (tenant_id = get_my_tenant_id());
CREATE POLICY "daily_sales_insert" ON daily_sales
  FOR INSERT WITH CHECK (tenant_id = get_my_tenant_id());
CREATE POLICY "daily_sales_update" ON daily_sales
  FOR UPDATE USING (tenant_id = get_my_tenant_id());
CREATE POLICY "daily_sales_delete" ON daily_sales
  FOR DELETE USING (tenant_id = get_my_tenant_id());

-- tournaments
CREATE POLICY "tournaments_select" ON tournaments
  FOR SELECT USING (tenant_id = get_my_tenant_id());
CREATE POLICY "tournaments_insert" ON tournaments
  FOR INSERT WITH CHECK (tenant_id = get_my_tenant_id());
CREATE POLICY "tournaments_update" ON tournaments
  FOR UPDATE USING (tenant_id = get_my_tenant_id());
CREATE POLICY "tournaments_delete" ON tournaments
  FOR DELETE USING (tenant_id = get_my_tenant_id());

-- tournament_entries（親テーブルのtenant_id経由）
CREATE POLICY "tournament_entries_select" ON tournament_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_entries.tournament_id
      AND tournaments.tenant_id = get_my_tenant_id()
    )
  );
CREATE POLICY "tournament_entries_insert" ON tournament_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_entries.tournament_id
      AND tournaments.tenant_id = get_my_tenant_id()
    )
  );
CREATE POLICY "tournament_entries_update" ON tournament_entries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_entries.tournament_id
      AND tournaments.tenant_id = get_my_tenant_id()
    )
  );
CREATE POLICY "tournament_entries_delete" ON tournament_entries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_entries.tournament_id
      AND tournaments.tenant_id = get_my_tenant_id()
    )
  );

-- inventory_records
CREATE POLICY "inventory_records_select" ON inventory_records
  FOR SELECT USING (tenant_id = get_my_tenant_id());
CREATE POLICY "inventory_records_insert" ON inventory_records
  FOR INSERT WITH CHECK (tenant_id = get_my_tenant_id());
CREATE POLICY "inventory_records_update" ON inventory_records
  FOR UPDATE USING (tenant_id = get_my_tenant_id());
CREATE POLICY "inventory_records_delete" ON inventory_records
  FOR DELETE USING (tenant_id = get_my_tenant_id());
