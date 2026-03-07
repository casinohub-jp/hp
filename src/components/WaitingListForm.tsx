"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function WaitingListForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error();
      setStatus("sent");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <CheckCircle2 size={32} className="text-ch-accent-light" />
        <p className="text-white font-bold">登録ありがとうございます！</p>
        <p className="text-white/50 text-sm">確認メールをお送りしました。</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-2 text-xs text-white/40 underline hover:text-white/60"
        >
          別のアドレスで登録する
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col sm:flex-row gap-3"
      onSubmit={handleSubmit}
    >
      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-ch-accent focus:ring-2 focus:ring-ch-accent/30"
        required
        disabled={status === "sending"}
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-gradient-to-r from-ch-primary to-ch-accent hover:opacity-90 text-white font-bold px-7 py-3.5 rounded-xl transition-all whitespace-nowrap shadow-lg shadow-ch-primary/20 disabled:opacity-50"
      >
        {status === "sending" ? "送信中..." : "登録する"}
      </button>
      {status === "error" && (
        <p className="text-red-300 text-xs mt-1 sm:mt-0 sm:self-center">送信に失敗しました</p>
      )}
    </form>
  );
}
