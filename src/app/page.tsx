import Link from "next/link";
import {
  Trophy,
  UserPlus,
  LayoutGrid,
  Award,
  ChevronRight,
  Mail,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { FEATURES, FAQ_ITEMS } from "@/lib/constants";
import { getAllArticles } from "@/lib/media";
import { ArticleCard } from "@/components/ArticleCard";
import { WaitingListForm } from "@/components/WaitingListForm";

const ICON_MAP = {
  Trophy,
  UserPlus,
  LayoutGrid,
  Award,
} as const;

const PROBLEMS = [
  { emoji: "🏆", title: "トーナメントの順位集計がExcel頼み", description: "大会のたびにExcelで手入力。計算ミスで順位が変わるとクレームに直結する。" },
  { emoji: "📋", title: "参加者の受付・チェックインが混乱", description: "当日の参加人数変動、レイトレジスト対応…紙とLINEで回すのに限界を感じている。" },
  { emoji: "🃏", title: "テーブル割り当てに毎回悩む", description: "参加人数に応じたテーブル配置・移動を頭の中で計算。大会が大きくなるほどパンクする。" },
  { emoji: "💰", title: "賞金・ポイント配分で揉める", description: "配分ルールがあいまいだったり、計算が合わなかったり。参加者からの信頼に関わる問題。" },
];

export default function HomePage() {
  const articles = getAllArticles().slice(0, 3);

  return (
    <>
      {/* ===== Hero（ダーク島） ===== */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-ch-hero-from via-[#1a0d3d] to-ch-hero-to">
        {/* グロー */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(217,70,239,0.2),transparent_55%)] animate-glow" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(6,182,212,0.15),transparent_55%)] animate-glow" style={{ animationDelay: "2.5s" }} />

        {/* カード柄 */}
        <span className="suit-deco top-[15%] left-[8%] animate-float">♠</span>
        <span className="suit-deco top-[18%] right-[10%] animate-float-reverse" style={{ fontSize: "8rem", animationDelay: "1s" }}>♥</span>
        <span className="suit-deco bottom-[15%] left-[15%] animate-float-reverse" style={{ animationDelay: "3s" }}>♦</span>
        <span className="suit-deco bottom-[20%] right-[8%] animate-float" style={{ fontSize: "5rem", animationDelay: "2s" }}>♣</span>

        <div className="relative mx-auto max-w-3xl text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur">
            <Sparkles size={14} className="text-ch-accent-light" />
            <span className="text-xs font-medium text-white/70">業界初 — アミューズメントカジノ特化SaaS</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-[1.1] mb-6 tracking-tight text-white">
            トーナメント運営を、
            <br />
            <span className="bg-gradient-to-r from-ch-primary-light via-ch-accent-light to-ch-primary-light bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_4s_linear_infinite]">
              もっとスマートに。
            </span>
          </h1>

          <p className="text-white/60 text-lg md:text-xl mb-10 max-w-lg mx-auto leading-relaxed">
            エントリー、テーブル割当、順位集計。
            <br />
            面倒な作業をまとめてクラウドへ。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#waitlist"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-ch-primary to-ch-accent text-white font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 shadow-xl shadow-ch-primary/25"
            >
              <Mail size={18} />
              事前登録する（無料）
            </a>
          </div>
        </div>
      </section>

      {/* ===== Problems — 横スクロール風ストリップ ===== */}
      <section className="py-20 px-4 bg-ch-bg relative overflow-hidden">
        <span className="suit-deco-light top-[10%] right-[5%] animate-float" style={{ animationDelay: "1s" }}>♠</span>
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-ch-primary font-bold text-sm tracking-widest uppercase mb-3">Problems</p>
          <h2 className="text-2xl md:text-3xl font-bold text-center text-ch-text mb-12">
            こんな課題、ありませんか？
          </h2>
          {/* 番号付き縦スタック — Lunaのグリッドカードとは全く違う */}
          <div className="space-y-4">
            {PROBLEMS.map((p, i) => (
              <div
                key={p.title}
                className="flex items-start gap-5 bg-white rounded-2xl p-6 border border-ch-border hover:border-ch-primary/30 hover:shadow-lg hover:shadow-ch-primary/5 transition-all group"
              >
                <span className="text-4xl">{p.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-ch-primary bg-ch-primary/10 px-2 py-0.5 rounded-full">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-bold text-ch-text group-hover:text-ch-primary transition-colors">{p.title}</h3>
                  </div>
                  <p className="text-sm text-ch-text-secondary leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Features — 左右交互レイアウト ===== */}
      <section className="py-20 px-4 bg-ch-surface-alt relative">
        <span className="suit-deco-light bottom-[5%] left-[3%] animate-float-reverse">♦</span>
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-ch-accent font-bold text-sm tracking-widest uppercase mb-3">Features</p>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-ch-text">
            Casinohubでできること
          </h2>
          <p className="text-center text-ch-text-muted mb-14 text-sm">トーナメント運営に必要な機能を、ひとつのツールに。</p>
          <div className="space-y-6">
            {FEATURES.map((f, i) => {
              const Icon = ICON_MAP[f.icon];
              const isEven = i % 2 === 0;
              return (
                <div
                  key={f.title}
                  className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-6 bg-white rounded-3xl p-8 border border-ch-border hover:shadow-xl hover:shadow-ch-primary/5 transition-all group`}
                >
                  <div className={`shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center ${isEven ? "bg-gradient-to-br from-ch-primary/15 to-ch-primary/5" : "bg-gradient-to-br from-ch-accent/15 to-ch-accent/5"}`}>
                    <Icon size={36} className={isEven ? "text-ch-primary" : "text-ch-accent"} />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-lg font-bold text-ch-text mb-2 group-hover:text-ch-primary transition-colors">{f.title}</h3>
                    <p className="text-sm text-ch-text-secondary leading-relaxed">{f.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Waiting List（ダーク島） ===== */}
      <section id="waitlist" className="relative py-24 px-4 overflow-hidden bg-gradient-to-br from-ch-hero-from via-[#1a0d3d] to-ch-hero-to">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse,rgba(217,70,239,0.15),transparent_70%)]" />
        <span className="suit-deco top-[10%] left-[5%] animate-float" style={{ fontSize: "4rem" }}>♥</span>
        <span className="suit-deco bottom-[10%] right-[5%] animate-float-reverse" style={{ fontSize: "4rem", animationDelay: "2s" }}>♣</span>
        <div className="relative mx-auto max-w-md text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
            事前登録
          </h2>
          <p className="text-white/60 mb-8">
            βテストの準備が整い次第、ご案内いたします。
          </p>
          <WaitingListForm />
          <p className="text-xs text-white/30 mt-4">
            ※ 登録は無料です。スパムメールは送りません。
          </p>
        </div>
      </section>

      {/* ===== Vision — タイムラインレイアウト ===== */}
      <section className="py-20 px-4 bg-ch-bg relative">
        <span className="suit-deco-light top-[8%] right-[6%] animate-float" style={{ animationDelay: "2s" }}>♣</span>
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <p className="text-ch-accent font-bold text-sm tracking-widest uppercase mb-3">What we&apos;re building</p>
            <h2 className="text-2xl md:text-3xl font-bold text-ch-text">
              こんなSaaSを考えています
            </h2>
            <p className="mt-3 text-ch-text-secondary max-w-xl mx-auto">
              アミューズメントカジノ業界に特化した管理ツールは、まだほとんど存在しません。
              まずはトーナメント管理を軸に開発を始めていますが、
              正直なところ、現場で本当に必要な機能はまだ手探りです。
            </p>
          </div>
          {/* 機能候補 */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border-2 border-ch-primary/30">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold text-white bg-ch-primary px-2.5 py-0.5 rounded-full">メイン</span>
                <h3 className="font-bold text-ch-text">トーナメント管理</h3>
              </div>
              <p className="text-sm text-ch-text-secondary leading-relaxed">
                参加者登録・テーブル割当・順位集計・賞金配分をまとめて管理。
                Excel集計のミスやトラブルをなくします。
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-ch-border">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold text-ch-accent bg-ch-accent/10 px-2.5 py-0.5 rounded-full">検討中</span>
                <h3 className="font-bold text-ch-text">チップ管理・棚卸し</h3>
              </div>
              <p className="text-sm text-ch-text-secondary leading-relaxed">
                チップの購入・払出・回収の記録やテーブル別の棚卸し。
                そもそもニーズがあるのか、現場の方に聞いてみたいところです。
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-ch-border">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold text-ch-accent bg-ch-accent/10 px-2.5 py-0.5 rounded-full">検討中</span>
                <h3 className="font-bold text-ch-text">売上レポート・テーブル稼働分析</h3>
              </div>
              <p className="text-sm text-ch-text-secondary leading-relaxed">
                日次・月次のレポート自動生成やテーブルの稼働率可視化。
                どこまでの粒度が必要なのか、ぜひ教えていただけると助かります。
              </p>
            </div>
          </div>
          {/* フィードバックCTA */}
          <div className="mt-10 bg-gradient-to-r from-ch-primary/5 to-ch-accent/5 rounded-2xl p-6 border border-ch-primary/15">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-ch-primary/10 flex items-center justify-center shrink-0">
                <MessageCircle size={20} className="text-ch-primary" />
              </div>
              <div>
                <p className="font-bold text-ch-text">一緒に作りませんか？</p>
                <p className="mt-1 text-sm text-ch-text-secondary">
                  「うちではこう管理してる」「これがあったら絶対使う」「それは要らない」——
                  どんな声でも開発の方向性に直接反映します。
                  アミューズメントカジノの運営に関わる方、ぜひ気軽に教えてください。
                </p>
                <Link
                  href="/contact"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-ch-primary hover:text-ch-primary-dark transition-colors"
                >
                  お問い合わせ →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ — インライン展開（アコーディオンだが見た目が違う） ===== */}
      <section className="py-20 px-4 bg-ch-surface-alt">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-ch-primary font-bold text-sm tracking-widest uppercase mb-3">FAQ</p>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-ch-text">
            よくある質問
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <details
                key={item.question}
                className="bg-white rounded-2xl border border-ch-border group overflow-hidden"
              >
                <summary className="flex items-center gap-4 cursor-pointer p-5 list-none">
                  <span className="w-8 h-8 rounded-lg bg-ch-primary/10 text-ch-primary flex items-center justify-center text-xs font-bold shrink-0">
                    Q{i + 1}
                  </span>
                  <span className="font-bold text-ch-text flex-1">{item.question}</span>
                  <ChevronRight
                    size={16}
                    className="text-ch-text-muted group-open:rotate-90 transition-transform shrink-0"
                  />
                </summary>
                <div className="px-5 pb-5 pl-[4.25rem] text-sm text-ch-text-secondary leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Articles ===== */}
      {articles.length > 0 && (
        <section className="py-20 px-4 bg-ch-bg">
          <div className="mx-auto max-w-4xl">
            <p className="text-center text-ch-accent font-bold text-sm tracking-widest uppercase mb-3">Column</p>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-ch-text">コラム</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {articles.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/column"
                className="text-sm text-ch-primary hover:text-ch-primary-dark transition-colors font-bold"
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
