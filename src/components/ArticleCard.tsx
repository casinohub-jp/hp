import Link from "next/link";
import type { Article } from "@/lib/media";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/column/${article.slug}`}
      className="block rounded-xl bg-ch-surface border border-ch-border p-5 hover:border-ch-primary/30 hover:shadow-md transition-all"
    >
      <p className="text-xs text-ch-text-muted mb-2">
        {article.date} ・ {article.category}
      </p>
      <h3 className="text-base font-semibold text-ch-text mb-2 line-clamp-2">
        {article.title}
      </h3>
      <p className="text-sm text-ch-text-secondary line-clamp-2">
        {article.description}
      </p>
      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded bg-ch-surface-alt text-ch-primary-dark"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
