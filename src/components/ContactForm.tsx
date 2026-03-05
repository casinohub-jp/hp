"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    storeName: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 py-12 bg-white rounded-2xl border border-ch-border">
        <CheckCircle2 size={36} className="text-ch-green" />
        <p className="text-lg font-bold text-ch-text">
          送信しました
        </p>
        <p className="text-sm text-ch-text-secondary">
          内容を確認のうえ、折り返しご連絡いたします。
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white border border-ch-border text-ch-text placeholder:text-ch-text-muted focus:outline-none focus:border-ch-primary focus:ring-2 focus:ring-ch-primary/20 transition-all";

  return (
    <form
      className="space-y-4 bg-white rounded-2xl border border-ch-border p-6"
      onSubmit={handleSubmit}
    >
      <div>
        <label className="block text-sm font-medium text-ch-text mb-1.5">
          お名前
        </label>
        <input
          type="text"
          placeholder="山田 太郎"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ch-text mb-1.5">
          メールアドレス <span className="text-ch-red">*</span>
        </label>
        <input
          type="email"
          placeholder="info@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ch-text mb-1.5">
          店舗名
        </label>
        <input
          type="text"
          placeholder="ポーカールーム○○"
          value={form.storeName}
          onChange={(e) => setForm({ ...form, storeName: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ch-text mb-1.5">
          お問い合わせ内容 <span className="text-ch-red">*</span>
        </label>
        <textarea
          rows={5}
          placeholder="導入のご相談、ご質問など"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={inputClass}
          required
        />
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-ch-primary to-ch-accent hover:opacity-90 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-ch-primary/20 disabled:opacity-50"
      >
        <Send size={16} />
        {status === "sending" ? "送信中..." : "送信する"}
      </button>
      {status === "error" && (
        <p className="text-ch-red text-sm text-center">
          送信に失敗しました。時間をおいて再度お試しください。
        </p>
      )}
    </form>
  );
}
