import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  onSwitchToLogin: () => void
}

export default function SignupPage({ onSwitchToLogin }: Props) {
  const { signup } = useAuth()
  const [storeName, setStoreName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }
    if (password !== passwordConfirm) {
      setError('パスワードが一致しません')
      return
    }
    if (!storeName.trim()) {
      setError('店舗名を入力してください')
      return
    }

    setLoading(true)
    const result = await signup(email, password, storeName.trim())
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
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
          {success ? (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">登録完了</h2>
              <div className="text-sm text-[#2d8a4e] bg-[#2d8a4e]/10 border border-[#2d8a4e]/30 rounded-lg p-3">
                確認メールを送信しました。メール内のリンクをクリックして、アカウントを有効化してください。
              </div>
              <button
                onClick={onSwitchToLogin}
                className="w-full bg-[#2d8a4e] hover:bg-[#247a42] rounded-lg py-2.5 text-sm font-medium text-white transition-colors"
              >
                ログインへ
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-bold text-white">新規登録</h2>
              <div>
                <label className="block text-sm text-[#8090b0] mb-1">店舗名</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  placeholder="例: Poker Room ABC"
                  className="w-full bg-[#0d1420] border border-[#2a3050] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#2d8a4e] placeholder-[#506080]"
                  required
                />
              </div>
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
                  placeholder="6文字以上"
                  className="w-full bg-[#0d1420] border border-[#2a3050] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#2d8a4e] placeholder-[#506080]"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm text-[#8090b0] mb-1">パスワード（確認）</label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  placeholder="もう一度入力"
                  className="w-full bg-[#0d1420] border border-[#2a3050] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#2d8a4e] placeholder-[#506080]"
                  required
                  minLength={6}
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
                {loading ? '登録中...' : '登録する'}
              </button>
              <div className="text-center text-sm">
                <span className="text-[#8090b0]">アカウントをお持ちの方 </span>
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-[#2d8a4e] hover:text-[#3aa05e] transition-colors"
                >
                  ログイン
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
