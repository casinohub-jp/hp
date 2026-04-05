import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning'

interface ToastItem {
  id: string
  type: ToastType
  message: string
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2, 9)
    setToasts(prev => [...prev, { id, type, message }])
    // 3秒後に自動消去
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* トースト表示エリア */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const typeStyles: Record<ToastType, { bg: string; border: string; icon: typeof CheckCircle2 }> = {
  success: { bg: 'bg-[#2d8a4e]/15', border: 'border-[#2d8a4e]/40', icon: CheckCircle2 },
  error: { bg: 'bg-red-500/15', border: 'border-red-500/40', icon: AlertCircle },
  warning: { bg: 'bg-amber-500/15', border: 'border-amber-500/40', icon: AlertTriangle },
}

const typeTextColors: Record<ToastType, string> = {
  success: 'text-[#2d8a4e]',
  error: 'text-red-400',
  warning: 'text-amber-400',
}

function ToastItem({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const style = typeStyles[toast.type]
  const textColor = typeTextColors[toast.type]
  const Icon = style.icon

  return (
    <div
      className={`pointer-events-auto flex items-center gap-2 min-w-[280px] max-w-[400px] ${style.bg} border ${style.border} rounded-lg px-4 py-3 shadow-lg animate-slide-in`}
    >
      <Icon size={18} className={textColor} />
      <span className="flex-1 text-sm text-white">{toast.message}</span>
      <button
        onClick={onClose}
        className="text-[#8090b0] hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}
