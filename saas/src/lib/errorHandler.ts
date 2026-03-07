/**
 * Supabase操作エラーのハンドリングユーティリティ
 * エラーの種類を判別して適切なメッセージを返す
 */

export type ErrorCategory = 'network' | 'auth' | 'server' | 'validation' | 'unknown'

export interface ClassifiedError {
  category: ErrorCategory
  message: string
  shouldRedirectToLogin: boolean
}

/**
 * エラーを分類して適切なメッセージを返す
 */
export function classifyError(error: unknown): ClassifiedError {
  // ネットワークエラー
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return {
      category: 'network',
      message: 'ネットワークに接続できません。接続を確認してください。',
      shouldRedirectToLogin: false,
    }
  }

  // Supabase PostgrestError
  if (isPostgrestError(error)) {
    const code = error.code
    const message = error.message || ''

    // 認証エラー
    if (code === 'PGRST301' || code === '401' || message.includes('JWT')) {
      return {
        category: 'auth',
        message: 'セッションが切れました。再ログインしてください。',
        shouldRedirectToLogin: true,
      }
    }

    // RLS違反（権限不足）
    if (code === '42501' || message.includes('row-level security')) {
      return {
        category: 'auth',
        message: 'この操作を行う権限がありません。',
        shouldRedirectToLogin: false,
      }
    }

    // バリデーションエラー（制約違反）
    if (code === '23505') {
      return {
        category: 'validation',
        message: 'このデータは既に登録されています。',
        shouldRedirectToLogin: false,
      }
    }

    if (code === '23503') {
      return {
        category: 'validation',
        message: '関連するデータが見つかりません。画面を更新してください。',
        shouldRedirectToLogin: false,
      }
    }

    // サーバーエラー
    if (code?.startsWith('5') || code === 'PGRST') {
      return {
        category: 'server',
        message: 'サーバーエラーが発生しました。しばらくしてからお試しください。',
        shouldRedirectToLogin: false,
      }
    }
  }

  // Error型の場合
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()

    if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('offline')) {
      return {
        category: 'network',
        message: 'ネットワークに接続できません。接続を確認してください。',
        shouldRedirectToLogin: false,
      }
    }

    if (msg.includes('jwt') || msg.includes('token') || msg.includes('session') || msg.includes('unauthorized') || msg.includes('401')) {
      return {
        category: 'auth',
        message: 'セッションが切れました。再ログインしてください。',
        shouldRedirectToLogin: true,
      }
    }

    if (msg.includes('tenant_id')) {
      return {
        category: 'auth',
        message: 'ログイン情報が取得できません。再ログインしてください。',
        shouldRedirectToLogin: true,
      }
    }
  }

  // その他
  return {
    category: 'unknown',
    message: '保存に失敗しました。しばらくしてからお試しください。',
    shouldRedirectToLogin: false,
  }
}

// Supabase PostgrestError の判定
function isPostgrestError(error: unknown): error is { code: string; message: string; details: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  )
}
