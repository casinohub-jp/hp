export const BRAND = {
  name: "Casinohub",
  url: "https://casinohub.jp",
  description: "アミューズメントカジノ向け店舗管理SaaS",
};

export const NAV_ITEMS = [
  { label: "機能", href: "/#features" },
  { label: "構想", href: "/#vision" },
  { label: "FAQ", href: "/#faq" },
  { label: "コラム", href: "/column" },
];

export const FEATURES = [
  {
    title: "チップ管理",
    description: "購入・払出・回収を正確に記録。CSV出力にも対応。",
    icon: "Coins" as const,
  },
  {
    title: "売上レポート",
    description: "日次・月次の売上を自動集計。数字で店舗の状態を把握。",
    icon: "BarChart3" as const,
  },
  {
    title: "棚卸し",
    description: "保管庫・テーブル別のチップカウントと差異チェックを効率化。",
    icon: "ClipboardCheck" as const,
  },
  {
    title: "テーブル管理",
    description: "テーブルの稼働状況やディーラーのアサインをリアルタイムで把握。",
    icon: "LayoutGrid" as const,
  },
];

export const FAQ_ITEMS = [
  {
    question: "アミューズメントカジノとは？",
    answer:
      "風営法の「遊技場営業」許可で運営される、換金なしのエンターテインメント施設です。ポーカー・ブラックジャック・ルーレットなどのカジノゲームを、お金を賭けずに楽しめます。",
  },
  {
    question: "料金はいくらですか？",
    answer:
      "現在βテスト準備中です。正式な料金プランは追ってご案内いたします。βテストにご参加いただける店舗様は無料でご利用いただけます。",
  },
  {
    question: "どんな店舗に向いていますか？",
    answer:
      "ポーカールーム、カジノバー、アミューズメントカジノ、カジノイベント運営会社など、カジノゲームを扱うすべての店舗にご利用いただけます。",
  },
  {
    question: "データの安全性は？",
    answer:
      "Supabaseによるデータベース暗号化とRow Level Security（RLS）で、店舗ごとにデータを完全に隔離しています。",
  },
  {
    question: "スマホでも使えますか？",
    answer:
      "はい。レスポンシブ対応しているので、タブレットやスマートフォンからもご利用いただけます。",
  },
  {
    question: "導入までの流れは？",
    answer:
      "ウェイティングリストにご登録 → βテストのご案内 → 導入サポートの流れで進めます。",
  },
];
