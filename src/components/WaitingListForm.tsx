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
        className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-indigo-300 focus:outline-none focus:border-ch-accent focus:ring-2 focus:ring-ch-accent/30"
        required
      />
      <button
        type="submit"
        className="bg-ch-accent hover:bg-ch-accent-light text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
      >
        登録する
      </button>
    </form>
  );
}
