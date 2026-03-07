/**
 * エラー監視モジュール
 *
 * Sentry導入時はここを差し替えるだけで済む設計。
 * 現在はコンソール出力のみ。
 *
 * Sentry導入手順:
 * 1. npm install @sentry/react
 * 2. このファイルの init() / captureException() / setUser() を
 *    Sentry.init() / Sentry.captureException() / Sentry.setUser() に差し替える
 * 3. .env に VITE_SENTRY_DSN を追加
 */

interface ErrorContext {
  [key: string]: string | number | boolean | undefined
}

let isInitialized = false

/**
 * エラー監視を初期化する
 * Sentry導入時: Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, ... })
 */
export function initErrorReporter(): void {
  if (isInitialized) return
  isInitialized = true

  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (dsn) {
    // Sentry導入時にここを実装
    console.info('[ErrorReporter] Sentry DSN detected but Sentry is not installed yet.')
  }

  // グローバルエラーハンドラー
  window.addEventListener('unhandledrejection', (event) => {
    captureException(event.reason, { source: 'unhandledrejection' })
  })

  window.addEventListener('error', (event) => {
    captureException(event.error, { source: 'window.onerror', message: event.message })
  })
}

/**
 * エラーを報告する
 */
export function captureException(error: unknown, context?: ErrorContext): void {
  // 本番環境でのみ外部に送信（開発中はconsole.errorのみ）
  if (import.meta.env.DEV) {
    console.error('[ErrorReporter]', error, context)
    return
  }

  // Sentry導入時: Sentry.captureException(error, { extra: context })
  console.error('[ErrorReporter] Production error:', error, context)
}

/**
 * ユーザーコンテキストを設定する
 * Sentry導入時: Sentry.setUser({ id: tenantId })
 */
export function setUser(tenantId: string): void {
  if (import.meta.env.DEV) {
    console.info('[ErrorReporter] User context set:', tenantId)
  }
  // Sentry導入時: Sentry.setUser({ id: tenantId })
}

/**
 * ユーザーコンテキストをクリアする（ログアウト時）
 */
export function clearUser(): void {
  // Sentry導入時: Sentry.setUser(null)
}
