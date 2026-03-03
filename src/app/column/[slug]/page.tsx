import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getArticle, getAllSlugs } from "@/lib/media";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <section className="pt-24 pb-16 px-4">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/column"
          className="inline-flex items-center gap-1 text-sm text-ch-text-muted hover:text-ch-primary mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          コラム一覧へ
        </Link>
        <p className="text-xs text-ch-text-muted mb-2">
          {article.date} ・ {article.category}
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-ch-text mb-6">
          {article.title}
        </h1>
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded bg-ch-surface-alt border border-ch-border text-ch-primary-dark"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="prose-ch">
          <MDXRemote source={article.content} />
        </div>
      </article>
    </section>
  );
}
