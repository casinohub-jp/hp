import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  tenantId: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error: string | null }>
  signup: (email: string, password: string, storeName: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // ユーザーのtenant_idを取得
  const fetchTenantId = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', userId)
      .single()
    if (error) {
      console.error('tenant_id取得エラー:', error)
      return null
    }
    return data?.tenant_id as string | null
  }, [])

  useEffect(() => {
    // 初期セッション確認
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const tid = await fetchTenantId(currentUser.id)
        setTenantId(tid)
      }
      setLoading(false)
    })

    // 認証状態の変化を購読
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          const tid = await fetchTenantId(currentUser.id)
          setTenantId(tid)
        } else {
          setTenantId(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchTenantId])

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }, [])

  const signup = useCallback(async (email: string, password: string, storeName: string) => {
    // 1. Supabase Authでユーザー作成
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) return { error: authError.message }
    if (!authData.user) return { error: 'ユーザーの作成に失敗しました' }

    // 2. テナント作成
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .insert({ name: storeName })
      .select('id')
      .single()
    if (tenantError) return { error: `店舗の作成に失敗しました: ${tenantError.message}` }

    // 3. usersテーブルにユーザー紐付け
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        tenant_id: tenantData.id,
        email: authData.user.email,
        role: 'owner',
      })
    if (userError) return { error: `ユーザー情報の保存に失敗しました: ${userError.message}` }

    setTenantId(tenantData.id)
    return { error: null }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setTenantId(null)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) return { error: error.message }
    return { error: null }
  }, [])

  return (
    <AuthContext.Provider value={{ user, tenantId, loading, login, signup, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
