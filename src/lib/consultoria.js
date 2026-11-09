// Las consultorías se cargan desde el panel como un curso más, con la categoría «Consultoría».
// El sitio las muestra en su propia sección (/consultoria) y no en la lista de cursos.
export const NOMBRE_CONSULTORIA = 'Consultoría'
export const esConsultoria = (c) => c?.categorias?.nombre === NOMBRE_CONSULTORIA
export const rutaCurso = (c) => (esConsultoria(c) ? `/consultoria/${c.id}` : `/cursos/${c.id}`)
