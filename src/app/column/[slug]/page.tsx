import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
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
  const url = `https://casinohub.jp/column/${slug}`;
  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: "article",
      publishedTime: article.date,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    url: `https://casinohub.jp/column/${slug}`,
    author: {
      "@type": "Organization",
      name: "Casinohub",
      url: "https://casinohub.jp",
    },
    publisher: {
      "@type": "Organization",
      name: "Casinohub",
      url: "https://casinohub.jp",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://casinohub.jp/column/${slug}`,
    },
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "トップ",
        item: "https://casinohub.jp",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "コラム",
        item: "https://casinohub.jp/column",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `https://casinohub.jp/column/${slug}`,
      },
    ],
  };

  return (
    <section className="pt-24 pb-20 px-4 bg-ch-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <article className="mx-auto max-w-3xl">
        <Link
          href="/column"
          className="inline-flex items-center gap-1 text-sm text-ch-text-muted hover:text-ch-primary mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={14} />
          コラム一覧へ
        </Link>
        <div className="bg-white rounded-2xl border border-ch-border p-6 md:p-10">
          <p className="text-xs text-ch-text-muted mb-3">
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
                  className="text-xs px-2.5 py-1 rounded-full bg-ch-surface-alt border border-ch-border text-ch-primary-dark font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="prose-ch">
            <MDXRemote
              source={article.content}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </div>
        </div>
      </article>
    </section>
  );
}
