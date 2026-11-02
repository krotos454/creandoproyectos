import { createClient } from '@supabase/supabase-js'

// Estas dos variables van en el archivo .env (ver .env.example).
// La "anon key" es pública por diseño: la seguridad real la dan las políticas
// RLS de la base de datos. NUNCA pongas acá la "service_role key".
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null
