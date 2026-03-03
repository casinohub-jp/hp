import type { Metadata } from "next";
import { getAllArticles } from "@/lib/media";
import { ArticleCard } from "@/components/ArticleCard";

export const metadata: Metadata = {
  title: "コラム",
  description:
    "アミューズメントカジノの開業・運営・チップ管理・法務に関する記事をまとめています。",
};

export default function ColumnPage() {
  const articles = getAllArticles();

  return (
    <section className="pt-24 pb-16 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-ch-text mb-2">コラム</h1>
          <p className="text-ch-text-secondary">
            アミューズメントカジノの開業・運営に役立つ情報をお届けします。
          </p>
        </div>
        {articles.length === 0 ? (
          <p className="text-ch-text-muted">記事はまだありません。</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {articles.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
