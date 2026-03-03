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
        className="flex-1 px-4 py-3 rounded-lg bg-ch-bg border border-ch-border text-ch-text placeholder:text-ch-text-muted focus:outline-none focus:border-ch-green"
        required
      />
      <button
        type="submit"
        className="bg-ch-green hover:bg-ch-green-light text-white font-semibold px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
      >
        登録する
      </button>
    </form>
  );
}
