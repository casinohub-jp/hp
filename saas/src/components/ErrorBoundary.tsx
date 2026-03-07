import { Component, type ReactNode } from 'react'
import { captureException } from '../lib/errorReporter'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * グローバルErrorBoundary
 * React レンダリング中のエラーをキャッチし、フォールバックUIを表示する。
 * エラーはerrorReporterに報告される（Sentry導入時は自動送信）。
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    captureException(error, {
      componentStack: errorInfo.componentStack ?? 'unknown',
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-[#0d1420] text-white flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-600/20 flex items-center justify-center">
              <span className="text-2xl">!</span>
            </div>
            <h2 className="text-xl font-bold mb-2">エラーが発生しました</h2>
            <p className="text-[#8090b0] mb-4 text-sm">
              予期しないエラーが発生しました。ページを再読み込みしてください。
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-left text-xs text-red-400 bg-[#121a2e] rounded-lg p-3 mb-4 overflow-auto max-h-40">
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="px-6 py-2.5 bg-[#2d8a4e] hover:bg-[#258040] rounded-lg text-sm font-medium transition-colors"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
