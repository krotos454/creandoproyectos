export const SERVICIOS_CONSULTORIA = [
  {
    nombre: 'Psicología para adolescentes y adultos',
    descripcion: 'Atención psicológica para adolescentes y adultos que atraviesan adicciones, depresión, soledad u otras dificultades.',
    flyer: '/flyers/consultoria-psicologia-adultos.jpeg',
  },
  {
    nombre: 'Estética y rehabilitación',
    descripcion: 'Tratamientos de estética y bienestar, masajes, magnetoterapia, ozonoterapia, osteopatía y rehabilitación muscular, articular, kinesiológica y postoperatoria.',
    flyer: '/flyers/consultoria-estetica-rehabilitacion.jpeg',
  },
  {
    nombre: 'Apoyo escolar',
    descripcion: 'Acompañamiento para niños, adolescentes y adultos: apoyo en materias, técnicas de estudio, lectura, escritura y seguimiento personalizado.',
    flyer: '/flyers/consultoria-apoyo-escolar.jpeg',
  },
  {
    nombre: 'Masajes',
    descripcion: 'Masajes relajantes y descontracturantes para favorecer el bienestar, aliviar molestias y mejorar la calidad de vida.',
    flyer: '/flyers/consultoria-masajes.jpeg',
  },
  {
    nombre: 'Estimulación temprana, fonoaudiología y psicopedagogía',
    descripcion: 'Atención especializada para niños y adolescentes en estimulación temprana, fonoaudiología y acompañamiento psicopedagógico.',
    flyer: '/flyers/consultoria-estimulacion-fonoaudiologia.jpeg',
  },
  {
    nombre: 'Psicología para niños y adolescentes',
    descripcion: 'Acompañamiento psicológico para niños y adolescentes, con orientación a sus familias. También atención a adultos que atraviesan adicciones, depresión o soledad.',
    flyer: '/flyers/consultoria-psicologia-infantojuvenil.jpeg',
  },
  {
    nombre: 'Psicopedagogía para niños y adolescentes',
    descripcion: 'Apoyo ante dificultades de aprendizaje, orientación para el estudio y acompañamiento del desarrollo integral.',
    flyer: '/flyers/consultoria-psicopedagogia.jpeg',
  },
]

export const WHATSAPP_TURNOS = [
  { numero: '11 3464-9614', url: 'https://wa.me/5491134649614' },
  { numero: '11 3040-1087', url: 'https://wa.me/5491130401087' },
]

const idServicio = (nombre) => `servicio-${nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

export const SERVICIOS_COMO_CURSOS = SERVICIOS_CONSULTORIA.map((servicio) => ({
  id: idServicio(servicio.nombre),
  nombre: servicio.nombre,
  descripcion_breve: servicio.descripcion,
  descripcion_completa: servicio.descripcion,
  imagen_url: servicio.flyer,
  imagen_miniatura_url: servicio.flyer,
  categorias: { nombre: 'Consultoría' },
}))

export const obtenerServicioComoCurso = (id) => SERVICIOS_COMO_CURSOS.find((servicio) => servicio.id === id) ?? null
