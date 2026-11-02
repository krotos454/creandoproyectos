// Datos editables del sitio: nombre, menú y contacto.
export const site = {
  name: 'creandoproyectos',
  tagline: 'Plataforma educativa',
  email: 'contacto@creandoproyectos.com',
  phone: '+54 11 5555-0000',
  address: 'Av. Principal 1234, Buenos Aires, Argentina',
}

// El menú principal: exactamente estas 3 opciones y en este orden.
export const menu = [
  { label: 'Inicio', to: '/' },
  { label: 'Cursos', to: '/cursos' },
  { label: 'Contacto', to: '/contacto' },
]

// Foto del banner de la página de inicio (Unsplash, hotlink). Para usar una imagen propia,
// ponela en public/img y cambiá esta dirección.
export const images = {
  hero: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=75',
}
