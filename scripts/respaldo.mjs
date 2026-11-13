import { createClient } from '@supabase/supabase-js'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import readline from 'node:readline'

const DOMINIO = 'creandoproyectos.app'

async function leerEnv() {
  const env = { ...process.env }
  try {
    const txt = await readFile(new URL('../.env', import.meta.url), 'utf8')
    for (const linea of txt.split(/\r?\n/)) {
      const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {}
  return env
}

function preguntar(texto, oculto = false) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
  if (oculto) {
    rl._writeToOutput = (s) => { if (s.includes(texto)) process.stdout.write(s) }
  }
  return new Promise((res) => rl.question(texto, (r) => { rl.close(); if (oculto) process.stdout.write('\n'); res(r.trim()) }))
}

async function listarArchivos(bucket, prefijo) {
  const salida = []
  const { data, error } = await bucket.list(prefijo, { limit: 1000 })
  if (error) throw error
  for (const item of data ?? []) {
    const ruta = prefijo ? `${prefijo}/${item.name}` : item.name
    if (item.id === null) salida.push(...(await listarArchivos(bucket, ruta)))
    else salida.push(ruta)
  }
  return salida
}

const env = await leerEnv()
const url = env.VITE_SUPABASE_URL
const clave = env.VITE_SUPABASE_ANON_KEY
if (!url || !clave) {
  console.error('Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env.')
  process.exit(1)
}

const supabase = createClient(url, clave, { auth: { persistSession: false } })
const usuario = (env.PROFESOR_USUARIO || (await preguntar('Usuario del profesor [profesor]: ')) || 'profesor').toLowerCase()
const password = env.PROFESOR_CLAVE || (await preguntar('Clave del profesor: ', true))
const email = usuario.includes('@') ? usuario : `${usuario}@${DOMINIO}`

const { error: errLogin } = await supabase.auth.signInWithPassword({ email, password })
if (errLogin) {
  console.error('No se pudo iniciar sesión:', errLogin.message)
  process.exit(1)
}

const ahora = new Date()
const pad = (n) => String(n).padStart(2, '0')
const carpeta = join('respaldo', `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}_${pad(ahora.getHours())}${pad(ahora.getMinutes())}`)
await mkdir(carpeta, { recursive: true })

const cursos = await supabase.from('cursos').select('*').order('created_at')
if (cursos.error) throw cursos.error
const categorias = await supabase.from('categorias').select('*').order('orden')
if (categorias.error) throw categorias.error
await writeFile(join(carpeta, 'cursos.json'), JSON.stringify(cursos.data, null, 2))
await writeFile(join(carpeta, 'categorias.json'), JSON.stringify(categorias.data, null, 2))
console.log(`Cursos guardados: ${cursos.data.length}`)

const rutas = new Map()
for (const c of cursos.data) {
  for (const [k, u] of [[c.imagen_key, c.imagen_url], [c.imagen_miniatura_key, c.imagen_miniatura_url], [c.imagen_original_key, c.imagen_original_url]]) {
    if (k && u) rutas.set(k, u)
  }
}
let bajados = 0
const fallidos = []
for (const [ruta, urlImg] of rutas) {
  try {
    const res = await fetch(urlImg)
    if (!res.ok) throw new Error(String(res.status))
    const destino = join(carpeta, 'imagenes', ruta)
    await mkdir(dirname(destino), { recursive: true })
    await writeFile(destino, Buffer.from(await res.arrayBuffer()))
    bajados++
  } catch { fallidos.push(ruta) }
}
console.log(`Imágenes guardadas: ${bajados} de ${rutas.size}`)
if (fallidos.length) console.warn('No se pudieron bajar:', fallidos.join(', '))
console.log(`\nRespaldo listo en la carpeta: ${carpeta}`)
await supabase.auth.signOut()
if (fallidos.length) process.exit(2)
