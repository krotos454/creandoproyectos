import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Spinner from '../../components/Spinner.jsx'
import CursoForm from '../../components/panel/CursoForm.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useAsync } from '../../lib/useAsync.js'
import { actualizarCurso, crearCurso, listarCategorias, obtenerCurso } from '../../lib/api.js'
import { CURSO_VACIO, cursoAFormulario } from '../../lib/validation.js'
import { mensajeError } from '../../lib/format.js'

export default function ProfesorCursoForm() {
  const { id } = useParams()
  const esNuevo = !id
  const toast = useToast()
  const navigate = useNavigate()

  const { data, loading, error } = useAsync(async () => {
    const [categorias, curso] = await Promise.all([
      listarCategorias(),
      esNuevo ? Promise.resolve(null) : obtenerCurso(id),
    ])
    return { categorias, curso }
  }, [id])

  const guardar = async (payload, modo) => {
    try {
      if (esNuevo) await crearCurso(payload)
      else await actualizarCurso(id, payload)
      toast.ok(
        modo === 'publicar' ? 'Curso publicado. Ya aparece en el sitio.'
        : modo === 'despublicar' ? 'Curso despublicado.'
        : modo === 'guardar' ? 'Cambios guardados. Ya se ven en el sitio.'
        : 'Borrador guardado.'
      )
      navigate('/profesor/panel')
      return true
    } catch (err) {
      toast.error(mensajeError(err))
      return false
    }
  }

  if (loading) return <Spinner />
  if (error) return <p className="form__error">{mensajeError(error)}</p>

  if (!esNuevo && !data.curso) {
    return (
      <div className="empty-box">
        <p>No encontramos ese curso.</p>
        <Link to="/profesor/panel" className="btn btn--primary">Volver a mis cursos</Link>
      </div>
    )
  }

  const inicial = esNuevo ? { ...CURSO_VACIO } : cursoAFormulario(data.curso)

  return (
    <>
      <Link to="/profesor/panel" className="back"><ArrowLeft size={16} /> Volver a mis cursos</Link>
      <div className="panel__title">
        <h1>{esNuevo ? 'Crear nuevo curso' : 'Editar curso'}</h1>
      </div>
      <CursoForm
        key={id ?? 'nuevo'}
        inicial={inicial}
        categorias={data.categorias}
        esNuevo={esNuevo}
        onGuardar={guardar}
      />
    </>
  )
}
