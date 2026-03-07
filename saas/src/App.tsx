import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './components/Toast'
import { AppProvider } from './contexts/AppContext'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

function AuthenticatedApp() {
  const { user, loading } = useAuth()
  const [authView, setAuthView] = useState<'login' | 'signup'>('login')

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1420] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-lg bg-[#2d8a4e] flex items-center justify-center font-bold text-lg text-white mx-auto mb-3 animate-pulse">
            C
          </div>
          <div className="text-[#8090b0] text-sm">読み込み中...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    if (authView === 'signup') {
      return <SignupPage onSwitchToLogin={() => setAuthView('login')} />
    }
    return <LoginPage onSwitchToSignup={() => setAuthView('signup')} />
  }

  return (
    <AppProvider>
      <AdminPage />
    </AppProvider>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </ToastProvider>
  )
}
