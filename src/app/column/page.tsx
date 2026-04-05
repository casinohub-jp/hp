import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/media";
import { ArticleCard } from "@/components/ArticleCard";

export const metadata: Metadata = {
  title: "コラム",
  description:
    "アミューズメントカジノの開業・運営・チップ管理・法務に関する記事をまとめています。",
  alternates: {
    canonical: "https://casinohub.jp/column",
  },
  openGraph: {
    url: "https://casinohub.jp/column",
  },
};

const PER_PAGE = 12;

export default async function ColumnPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const articles = getAllArticles();
  const totalPages = Math.ceil(articles.length / PER_PAGE);
  const paged = articles.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <section className="pt-24 pb-20 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10">
          <p className="text-ch-primary font-bold text-sm tracking-widest uppercase mb-2">Column</p>
          <h1 className="text-2xl md:text-3xl font-bold text-ch-text mb-2">コラム</h1>
          <p className="text-ch-text-secondary">
            アミューズメントカジノの開業・運営に役立つ情報をお届けします。
          </p>
        </div>
        {paged.length === 0 ? (
          <p className="text-ch-text-muted">記事はまだありません。</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {paged.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-2" aria-label="ページネーション">
            {currentPage > 1 && (
              <Link
                href={currentPage === 2 ? "/column" : `/column?page=${currentPage - 1}`}
                className="px-4 py-2 rounded border border-ch-border text-ch-text-secondary hover:border-ch-primary hover:text-ch-primary transition-colors text-sm"
              >
                ← 前へ
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={p === 1 ? "/column" : `/column?page=${p}`}
                className={`px-4 py-2 rounded border text-sm transition-colors ${
                  p === currentPage
                    ? "border-ch-primary bg-ch-primary text-white"
                    : "border-ch-border text-ch-text-secondary hover:border-ch-primary hover:text-ch-primary"
                }`}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </Link>
            ))}
            {currentPage < totalPages && (
              <Link
                href={`/column?page=${currentPage + 1}`}
                className="px-4 py-2 rounded border border-ch-border text-ch-text-secondary hover:border-ch-primary hover:text-ch-primary transition-colors text-sm"
              >
                次へ →
              </Link>
            )}
          </nav>
        )}
      </div>
    </section>
  );
}
