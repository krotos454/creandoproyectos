export const NOMBRE_CONSULTORIA = 'Consultoría'
export const esConsultoria = (c) => c?.categorias?.nombre === NOMBRE_CONSULTORIA
export const rutaCurso = (c) => (esConsultoria(c) ? `/consultoria/${c.id}` : `/cursos/${c.id}`)
