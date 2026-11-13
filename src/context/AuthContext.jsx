import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

const AuthContext = createContext(null)

const DOMINIO = 'creandoproyectos.app'
export const usuarioAEmail = (usuario) => {
  const u = String(usuario).trim().toLowerCase()
  return u.includes('@') ? u : `${u}@${DOMINIO}`
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [esProfesor, setEsProfesor] = useState(false)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  const user = session?.user ?? null
  const uid = user?.id

  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (!data.session) setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (!s) {
        setEsProfesor(false)
        setLoading(false)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const verificar = useCallback(async (id) => {
    const { data } = await supabase.from('profesor_acceso').select('user_id').eq('user_id', id).maybeSingle()
    setEsProfesor(!!data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !uid) return
    setLoading(true)
    verificar(uid)
  }, [uid, verificar])

  const value = useMemo(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      user,
      esProfesor,
      signIn: (usuario, clave) =>
        supabase.auth.signInWithPassword({ email: usuarioAEmail(usuario), password: clave }),
      signOut: () => supabase.auth.signOut(),
    }),
    [loading, user, esProfesor]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
