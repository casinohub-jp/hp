"use client";

export function WaitingListForm() {
  return (
    <form
      className="flex flex-col sm:flex-row gap-3"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="メールアドレス"
        className="flex-1 px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-ch-accent focus:ring-2 focus:ring-ch-accent/30"
        required
      />
      <button
        type="submit"
        className="bg-gradient-to-r from-ch-primary to-ch-accent hover:opacity-90 text-white font-bold px-7 py-3.5 rounded-xl transition-all whitespace-nowrap shadow-lg shadow-ch-primary/20"
      >
        登録する
      </button>
    </form>
  );
}
