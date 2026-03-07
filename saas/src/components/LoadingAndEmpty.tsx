/**
 * ローディングスケルトンと空状態表示の共通コンポーネント
 */

// スケルトンUIパーツ
export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] p-4 animate-pulse">
      <div className="h-4 bg-[#2a3050] rounded w-3/4 mb-3" />
      <div className="h-3 bg-[#2a3050] rounded w-1/2 mb-2" />
      <div className="h-3 bg-[#2a3050] rounded w-1/3" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between p-4 animate-pulse">
      <div className="flex-1">
        <div className="h-4 bg-[#2a3050] rounded w-2/5 mb-2" />
        <div className="h-3 bg-[#2a3050] rounded w-1/4" />
      </div>
      <div className="h-8 w-16 bg-[#2a3050] rounded" />
    </div>
  )
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-[#2a3050] bg-[#121a2e] p-4 animate-pulse">
          <div className="w-9 h-9 bg-[#2a3050] rounded-lg mb-2" />
          <div className="h-3 bg-[#2a3050] rounded w-2/3 mb-2" />
          <div className="h-5 bg-[#2a3050] rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-[#2a3050] bg-[#121a2e] overflow-hidden">
      <div className="border-b border-[#2a3050] p-4 animate-pulse">
        <div className="flex gap-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 bg-[#2a3050] rounded w-16" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-[#2a3050]/30 p-4 animate-pulse">
          <div className="flex gap-8">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="h-3 bg-[#2a3050] rounded w-16" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// 空状態コンポーネント
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="text-[#8090b0] opacity-40 mb-4 flex justify-center">
        {icon}
      </div>
      <p className="text-[#8090b0] font-medium">{title}</p>
      <p className="text-sm text-[#8090b0]/70 mt-1">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-[#2d8a4e] hover:bg-[#247a42] rounded-lg text-sm font-medium text-white transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// 全画面ローディング
export function FullPageLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-10 h-10 rounded-lg bg-[#2d8a4e] flex items-center justify-center font-bold text-lg text-white mx-auto mb-3 animate-pulse">
          C
        </div>
        <div className="text-[#8090b0] text-sm">読み込み中...</div>
      </div>
    </div>
  )
}
