import Link from "next/link";
import {
  Coins,
  BarChart3,
  ClipboardCheck,
  LayoutGrid,
  ChevronDown,
  Mail,
  AlertTriangle,
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
    title: "チップ棚卸しに毎日1時間以上",
    description:
      "閉店後に手作業でチップを数え、Excelに入力。ミスがあると翌日に持ち越し。",
  },
  {
    title: "売上の全体像がつかめない",
    description:
      "チップ購入・ドリンク・参加費の記録がバラバラで、正確な売上を出すのに時間がかかる。",
  },
  {
    title: "テーブル稼働が見えない",
    description:
      "どのテーブルが空いているか、ディーラーの配置が適切かを感覚で判断している。",
  },
  {
    title: "トーナメント集計でミス",
    description:
      "Excelでの順位集計・賞金配分のミスがクレームにつながることがある。",
  },
];

export default function HomePage() {
  const articles = getAllArticles().slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-20 px-4">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            アミューズメントカジノの
            <br />
            店舗管理を、<span className="text-ch-gold">ひとつに。</span>
          </h1>
          <p className="text-ch-text-secondary text-lg mb-8 max-w-xl mx-auto">
            チップ管理・売上分析・棚卸し・テーブル管理をまとめてデジタル化。
            <br className="hidden md:block" />
            現場の「めんどくさい」を減らすクラウドサービスです。
          </p>
          <a
            href="#waitlist"
            className="inline-flex items-center gap-2 bg-ch-green hover:bg-ch-green-light text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <Mail size={18} />
            事前登録する（無料）
          </a>
          <div className="mt-4">
            <a
              href="#features"
              className="text-ch-text-muted text-sm hover:text-ch-text-secondary transition-colors inline-flex items-center gap-1"
            >
              機能を見る <ChevronDown size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* Problems */}
      <section className="py-16 px-4 bg-ch-surface/50">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-ch-gold mb-3">
              <AlertTriangle size={18} />
              <span className="text-sm font-semibold">こんな課題ありませんか？</span>
            </div>
            <h2 className="text-2xl font-bold">
              Excel・紙・LINEでの管理に限界を感じていたら
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {PROBLEMS.map((p) => (
              <div
                key={p.title}
                className="bg-ch-surface border border-ch-border rounded-lg p-5"
              >
                <h3 className="font-semibold mb-1 text-ch-text">{p.title}</h3>
                <p className="text-sm text-ch-text-secondary">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-10">
            Casinohubでできること
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map((f) => {
              const Icon = ICON_MAP[f.icon];
              return (
                <div
                  key={f.title}
                  className="bg-ch-surface border border-ch-border rounded-lg p-6 hover:border-ch-green/40 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-ch-green/15 flex items-center justify-center">
                      <Icon size={20} className="text-ch-green" />
                    </div>
                    <h3 className="font-semibold text-ch-text">{f.title}</h3>
                  </div>
                  <p className="text-sm text-ch-text-secondary">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Waiting List */}
      <section id="waitlist" className="py-16 px-4 bg-ch-surface/50">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="text-2xl font-bold mb-3">事前登録</h2>
          <p className="text-ch-text-secondary mb-6">
            βテストの準備が整い次第、ご案内いたします。
          </p>
          <WaitingListForm />
          <p className="text-xs text-ch-text-muted mt-3">
            ※ 登録は無料です。スパムメールは送りません。
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-10">
            よくある質問
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="bg-ch-surface border border-ch-border rounded-lg group"
              >
                <summary className="flex items-center justify-between cursor-pointer p-5 font-semibold text-ch-text list-none">
                  {item.question}
                  <ChevronDown
                    size={16}
                    className="text-ch-text-muted group-open:rotate-180 transition-transform"
                  />
                </summary>
                <div className="px-5 pb-5 text-sm text-ch-text-secondary">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      {articles.length > 0 && (
        <section className="py-16 px-4 bg-ch-surface/50">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-center mb-8">コラム</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {articles.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
            <div className="text-center mt-6">
              <Link
                href="/column"
                className="text-sm text-ch-green hover:text-ch-green-light transition-colors"
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
