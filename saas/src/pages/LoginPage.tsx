import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  onSwitchToSignup: () => void
}

export default function LoginPage({ onSwitchToSignup }: Props) {
  const { login, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    if (result.error) {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('メールアドレスを入力してください')
      return
    }
    setError('')
    setLoading(true)
    const result = await resetPassword(email)
    if (result.error) {
      setError(result.error)
    } else {
      setResetSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0d1420] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#2d8a4e] flex items-center justify-center font-bold text-lg text-white">
              C
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Casinohub</h1>
          </div>
          <p className="text-sm text-[#8090b0]">トーナメント管理</p>
        </div>

        <div className="bg-[#121a2e] border border-[#2a3050] rounded-xl p-6">
          {showReset ? (
            // パスワードリセットフォーム
            <form onSubmit={handleReset} className="space-y-4">
              <h2 className="text-lg font-bold text-white">パスワードリセット</h2>
              {resetSent ? (
                <div className="text-sm text-[#2d8a4e] bg-[#2d8a4e]/10 border border-[#2d8a4e]/30 rounded-lg p-3">
                  リセット用のメールを送信しました。メールを確認してください。
                </div>
              ) : (
                <>
                  <p className="text-sm text-[#8090b0]">
                    登録済みのメールアドレスを入力してください。パスワードリセット用のリンクを送信します。
                  </p>
                  <div>
                    <label className="block text-sm text-[#8090b0] mb-1">メールアドレス</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[#0d1420] border border-[#2a3050] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#2d8a4e] placeholder-[#506080]"
                      required
                    />
                  </div>
                  {error && (
                    <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg p-3">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#2d8a4e] hover:bg-[#247a42] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg py-2.5 text-sm font-medium text-white transition-colors"
                  >
                    {loading ? '送信中...' : 'リセットメールを送信'}
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => { setShowReset(false); setResetSent(false); setError('') }}
                className="w-full text-sm text-[#8090b0] hover:text-white transition-colors"
              >
                ログインに戻る
              </button>
            </form>
          ) : (
            // ログインフォーム
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-lg font-bold text-white">ログイン</h2>
              <div>
                <label className="block text-sm text-[#8090b0] mb-1">メールアドレス</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#0d1420] border border-[#2a3050] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#2d8a4e] placeholder-[#506080]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#8090b0] mb-1">パスワード</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0d1420] border border-[#2a3050] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#2d8a4e] placeholder-[#506080]"
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg p-3">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2d8a4e] hover:bg-[#247a42] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg py-2.5 text-sm font-medium text-white transition-colors"
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </button>
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => { setShowReset(true); setError('') }}
                  className="text-[#8090b0] hover:text-white transition-colors"
                >
                  パスワードを忘れた方
                </button>
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  className="text-[#2d8a4e] hover:text-[#3aa05e] transition-colors"
                >
                  新規登録
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
