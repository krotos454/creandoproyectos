// Datos editables del sitio: nombre, menú y contacto.
export const site = {
  name: 'CreandoProyectos',
  tagline: 'Plataforma educativa',
  // Correo institucional (ej.: 'info@tudominio.com'). Lo usa el botón «Enviar un correo» de Contacto.
  email: '',
  // WhatsApp institucional: es el que usan todos los botones de consulta del sitio.
  whatsapp: '11 3605-2246',
  // Redes sociales: se muestran en el pie SOLO si ponés la dirección real (ej.: 'https://instagram.com/tu_usuario').
  social: { facebook: '', instagram: '' },
}

// El menú principal.
export const menu = [
  { label: 'Inicio', to: '/' },
  { label: 'Cursos', to: '/cursos' },
  { label: 'Consultoría', to: '/consultoria' },
  { label: 'Contacto', to: '/contacto' },
  { label: 'Sobre nosotros', to: '/nosotros' },
]

// Foto del banner de la página de inicio (Unsplash, hotlink). Para usar una imagen propia,
// ponela en public/img y cambiá esta dirección.
export const images = {
  hero: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=75',
}
