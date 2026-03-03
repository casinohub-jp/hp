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
        className="flex-1 px-4 py-3 rounded-lg bg-ch-bg border border-ch-border text-ch-text placeholder:text-ch-text-muted focus:outline-none focus:border-ch-gold focus:ring-1 focus:ring-ch-gold/30"
        required
      />
      <button
        type="submit"
        className="bg-gradient-to-r from-ch-gold to-ch-gold-light hover:from-ch-gold-light hover:to-ch-gold text-ch-bg font-semibold px-6 py-3 rounded-lg transition-all whitespace-nowrap"
      >
        登録する
      </button>
    </form>
  );
}
