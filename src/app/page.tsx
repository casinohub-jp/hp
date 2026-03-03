import Link from "next/link";
import {
  Coins,
  BarChart3,
  ClipboardCheck,
  LayoutGrid,
  ChevronDown,
  Mail,
  AlertTriangle,
  Lightbulb,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { FEATURES, FAQ_ITEMS } from "@/lib/constants";
import { getAllArticles } from "@/lib/media";
import { ArticleCard } from "@/components/ArticleCard";
import { WaitingListForm } from "@/components/WaitingListForm";

const ICON_MAP = {
  Coins,
  BarChart3,
  ClipboardCheck,
  LayoutGrid,
} as const;

const PROBLEMS = [
  {
    emoji: "🎰",
    title: "チップ棚卸しに毎日1時間以上",
    description:
      "閉店後に手作業でチップを数え、Excelに入力。ミスがあると翌日に持ち越し。",
  },
  {
    emoji: "📊",
    title: "売上の全体像がつかめない",
    description:
      "チップ購入・ドリンク・参加費の記録がバラバラで、正確な売上を出すのに時間がかかる。",
  },
  {
    emoji: "🃏",
    title: "テーブル稼働が見えない",
    description:
      "どのテーブルが空いているか、ディーラーの配置が適切かを感覚で判断している。",
  },
  {
    emoji: "🏆",
    title: "トーナメント集計でミス",
    description:
      "Excelでの順位集計・賞金配分のミスがクレームにつながることがある。",
  },
];

export default function HomePage() {
  const articles = getAllArticles().slice(0, 3);

  return (
    <>
      {/* ===== Hero ===== */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        {/* 背景グロー */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(224,64,251,0.18),transparent_55%)] animate-glow" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(34,211,238,0.12),transparent_55%)] animate-glow" style={{ animationDelay: "2.5s" }} />

        {/* カード柄デコレーション */}
        <span className="suit-deco top-[15%] left-[8%] animate-float">♠</span>
        <span className="suit-deco top-[20%] right-[10%] animate-float-reverse text-ch-primary/[0.04]" style={{ fontSize: "8rem", animationDelay: "1s" }}>♥</span>
        <span className="suit-deco bottom-[15%] left-[15%] animate-float-reverse" style={{ animationDelay: "3s" }}>♦</span>
        <span className="suit-deco bottom-[20%] right-[8%] animate-float" style={{ fontSize: "5rem", animationDelay: "2s" }}>♣</span>

        <div className="relative mx-auto max-w-3xl text-center animate-fade-in">
          {/* ステータスバッジ */}
          <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full glass-card neon-border">
            <Sparkles size={14} className="text-ch-accent" />
            <span className="text-xs font-medium text-ch-text-secondary">
              業界初 — アミューズメントカジノ特化SaaS
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-[1.1] mb-6 tracking-tight">
            カジノ運営を、
            <br />
            <span className="bg-gradient-to-r from-ch-primary via-ch-accent to-ch-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_4s_linear_infinite]">
              もっと自由に。
            </span>
          </h1>

          <p className="text-ch-text-secondary text-lg md:text-xl mb-10 max-w-lg mx-auto leading-relaxed">
            チップ管理、売上分析、テーブル運営。
            <br />
            すべてを一つのクラウドで。
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#waitlist"
              className="group relative inline-flex items-center gap-2 btn-shimmer text-white font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 shadow-xl shadow-ch-primary/20"
            >
              <Mail size={18} />
              事前登録する（無料）
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 text-ch-text-muted hover:text-ch-accent transition-colors text-sm"
            >
              機能を見る
              <ChevronDown size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ===== Problems — 斜めセクション ===== */}
      <section className="skew-top bg-ch-surface-alt py-20 px-4 relative">
        <span className="suit-deco top-[10%] right-[5%] animate-float" style={{ fontSize: "4rem", animationDelay: "1s" }}>♠</span>
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-ch-accent mb-3">
              <AlertTriangle size={18} />
              <span className="text-sm font-semibold tracking-wide">こんな課題ありませんか？</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-ch-text">
              Excel・紙・LINEでの管理に
              <span className="text-ch-primary">限界</span>を感じていたら
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {PROBLEMS.map((p) => (
              <div
                key={p.title}
                className="glass-card rounded-2xl p-6 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl shrink-0 mt-0.5">{p.emoji}</span>
                  <div>
                    <h3 className="font-bold mb-1.5 text-ch-text group-hover:text-ch-primary transition-colors">{p.title}</h3>
                    <p className="text-sm text-ch-text-secondary leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Features — Bento風 ===== */}
      <section id="features" className="py-20 px-4 relative">
        <span className="suit-deco bottom-[5%] left-[3%] animate-float-reverse" style={{ fontSize: "5rem" }}>♦</span>
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-ch-text">
            Casinohubで<span className="text-ch-accent">できること</span>
          </h2>
          <p className="text-center text-ch-text-muted mb-12 text-sm">まずはチップ管理と売上分析から。段階的に機能を拡張します。</p>
          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = ICON_MAP[f.icon];
              return (
                <div
                  key={f.title}
                  className={`glass-card rounded-2xl p-7 transition-all group ${i === 0 ? "md:row-span-2" : ""}`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${i % 2 === 0 ? "from-ch-primary/20 to-ch-primary/5" : "from-ch-accent/20 to-ch-accent/5"} flex items-center justify-center mb-4`}>
                    <Icon size={24} className={i % 2 === 0 ? "text-ch-primary" : "text-ch-accent"} />
                  </div>
                  <h3 className="text-lg font-bold text-ch-text mb-2 group-hover:text-ch-primary transition-colors">{f.title}</h3>
                  <p className="text-sm text-ch-text-secondary leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Waiting List ===== */}
      <section id="waitlist" className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ch-surface-alt/50 to-ch-bg" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse,rgba(224,64,251,0.1),transparent_70%)]" />
        <div className="relative mx-auto max-w-md text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-ch-text">
            事前登録
          </h2>
          <p className="text-ch-text-secondary mb-8">
            βテストの準備が整い次第、ご案内いたします。
          </p>
          <div className="glass-card rounded-2xl p-6 neon-border">
            <WaitingListForm />
          </div>
          <p className="text-xs text-ch-text-muted mt-4">
            ※ 登録は無料です。スパムメールは送りません。
          </p>
        </div>
      </section>

      {/* ===== Vision — SaaS構想 ===== */}
      <section id="vision" className="py-20 px-4 bg-ch-surface-alt relative">
        <span className="suit-deco top-[8%] right-[6%] animate-float" style={{ fontSize: "5rem", animationDelay: "2s" }}>♣</span>
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-ch-accent mb-3">
              <Lightbulb size={18} />
              <span className="text-sm font-semibold">開発ロードマップ</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-ch-text">
              こんなSaaSを<span className="text-ch-primary">作っています</span>
            </h2>
            <p className="mt-3 text-ch-text-secondary max-w-xl mx-auto">
              アミューズメントカジノ業界に特化した管理ツールは、まだほとんど存在しません。
              現場の声をもとに、本当に必要な機能を開発しています。
            </p>
          </div>
          <div className="glass-card rounded-2xl p-6 md:p-8">
            <div className="space-y-5">
              {[
                { label: "チップの購入・払出・回収をリアルタイムに記録", done: true },
                { label: "日次・月次の売上レポートを自動生成", done: true },
                { label: "テーブル別のチップ棚卸し＆差異チェック", done: true },
                { label: "テーブル稼働率・ディーラー配置の可視化", done: false },
                { label: "トーナメント管理（参加者・順位・賞金配分）", done: false },
                { label: "複数店舗の一元管理ダッシュボード", done: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${item.done ? "bg-ch-green shadow-[0_0_8px_rgba(52,211,153,0.4)]" : "bg-ch-border-hover"}`} />
                  <span className={`text-sm ${item.done ? "text-ch-text" : "text-ch-text-muted"}`}>
                    {item.label}
                    {!item.done && <span className="ml-2 text-xs text-ch-primary">(検討中)</span>}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-ch-primary/5 border border-ch-primary/20 p-5">
              <div className="flex items-start gap-3">
                <MessageCircle size={20} className="text-ch-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-ch-text">
                    現場の声を聞かせてください
                  </p>
                  <p className="mt-1 text-sm text-ch-text-secondary">
                    「こんな機能がほしい」「ここが困っている」など、ぜひ教えてください。
                    開発の優先順位に直接反映させていただきます。
                  </p>
                  <a
                    href="#waitlist"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-ch-primary hover:text-ch-primary-light transition-colors"
                  >
                    事前登録してフィードバックを送る →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-ch-text">
            よくある質問
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="glass-card rounded-2xl group"
              >
                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-ch-text list-none">
                  {item.question}
                  <ChevronDown
                    size={16}
                    className="text-ch-text-muted group-open:rotate-180 transition-transform"
                  />
                </summary>
                <div className="px-6 pb-6 text-sm text-ch-text-secondary leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Articles ===== */}
      {articles.length > 0 && (
        <section className="py-20 px-4 bg-ch-surface-alt">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-ch-text">コラム</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {articles.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/column"
                className="text-sm text-ch-accent hover:text-ch-accent-light transition-colors font-medium"
              >
                すべての記事を見る →
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
