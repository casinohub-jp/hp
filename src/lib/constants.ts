export const BRAND = {
  name: "Casinohub",
  url: "https://casinohub.jp",
  description: "アミューズメントカジノ向けトーナメント管理SaaS",
};

export const NAV_ITEMS = [
  { label: "ホーム", href: "/" },
  { label: "コラム", href: "/column" },
  { label: "お問い合わせ", href: "/contact" },
];

export const FEATURES = [
  {
    title: "トーナメント運営",
    description: "大会の作成・参加者登録・ブラインドレベル設定まで、一画面でまとめて管理。",
    icon: "Trophy" as const,
  },
  {
    title: "参加者管理・チェックイン",
    description: "事前エントリーと当日チェックインをスムーズに。レイトレジスト・リエントリーにも対応。",
    icon: "UserPlus" as const,
  },
  {
    title: "テーブル・シート割当",
    description: "参加人数に応じたテーブル配置と席順を自動生成。テーブルブレイクの再配置もワンタップ。",
    icon: "LayoutGrid" as const,
  },
  {
    title: "順位集計・プライズ配分",
    description: "リアルタイムで順位を更新し、賞金・ポイントの配分を自動計算。集計ミスをゼロに。",
    icon: "Award" as const,
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
      "トーナメントを定期開催しているポーカールーム、アミューズメントカジノ、カジノバー、カジノイベント運営会社など、大会運営の効率化を求めるすべての店舗にご利用いただけます。",
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
