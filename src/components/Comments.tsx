"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";

type Comment = {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
};

export default function Comments({
  project,
  articleSlug,
}: {
  project: string;
  articleSlug: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/comments?project=${project}&slug=${articleSlug}`,
      );
      if (res.ok) {
        setComments(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [project, articleSlug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project,
          article_slug: articleSlug,
          author_name: name.trim(),
          content: text.trim(),
        }),
      });
      if (res.ok) {
        setText("");
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        fetchComments();
      }
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white border border-ch-border text-ch-text placeholder:text-ch-text-muted focus:outline-none focus:border-ch-primary focus:ring-2 focus:ring-ch-primary/20 transition-all";

  return (
    <section className="mt-12 pt-8 border-t border-ch-border">
      <h2 className="flex items-center gap-2 text-xl font-bold text-ch-text mb-8">
        <MessageSquare size={20} className="text-ch-primary" />
        コメント
        {comments.length > 0 && (
          <span className="text-sm font-normal text-ch-text-muted">
            ({comments.length})
          </span>
        )}
      </h2>

      {/* コメント一覧 */}
      {loading ? (
        <div className="flex items-center gap-2 text-ch-text-muted text-sm py-4">
          <Loader2 size={16} className="animate-spin" />
          読み込み中...
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4 mb-10">
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-ch-surface-alt rounded-xl border border-ch-border p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-ch-text">
                  {c.author_name}
                </span>
                <span className="text-xs text-ch-text-muted">
                  {formatDate(c.created_at)}
                </span>
              </div>
              <p className="text-sm text-ch-text-secondary leading-relaxed whitespace-pre-wrap">
                {c.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ch-text-muted mb-8">
          まだコメントはありません。最初のコメントを書いてみませんか？
        </p>
      )}

      {/* 投稿フォーム */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="comment-name"
            className="block text-sm font-medium text-ch-text mb-1.5"
          >
            名前
          </label>
          <input
            id="comment-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="表示名"
            required
            maxLength={50}
            className={`${inputClass} max-w-xs`}
          />
        </div>
        <div>
          <label
            htmlFor="comment-content"
            className="block text-sm font-medium text-ch-text mb-1.5"
          >
            コメント
          </label>
          <textarea
            id="comment-content"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="この記事へのコメントを書く..."
            required
            maxLength={2000}
            rows={4}
            className={`${inputClass} resize-y`}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting || !name.trim() || !text.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-ch-primary to-ch-accent text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-ch-primary/20"
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            投稿する
          </button>
          {submitted && (
            <span className="text-sm text-ch-accent font-medium">
              コメントを投稿しました
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
