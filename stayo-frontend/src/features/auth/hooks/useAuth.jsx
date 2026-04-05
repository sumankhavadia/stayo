import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser, loginUser, logoutUser, signupUser } from '../authAPI'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    let active = true

    async function loadCurrentUser() {
      try {
        const user = await getCurrentUser()
        if (active) setCurrentUser(user)
      } catch {
        if (active) setCurrentUser(null)
      } finally {
        if (active) setLoadingAuth(false)
      }
    }

    loadCurrentUser()
    return () => {
      active = false
    }
  }, [])

  const logout = useCallback(async () => {
    await logoutUser()
    setCurrentUser(null)
  }, [])

  const login = useCallback(async (credentials) => {
    const user = await loginUser(credentials)
    setCurrentUser(user)
    return user
  }, [])

  const signup = useCallback(async (payload) => {
    const user = await signupUser(payload)
    setCurrentUser(user)
    return user
  }, [])

  const value = useMemo(
    () => ({ currentUser, loadingAuth, login, logout, signup }),
    [currentUser, loadingAuth, login, logout, signup],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}