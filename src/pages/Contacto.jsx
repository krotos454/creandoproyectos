import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { site } from '../config/site.js'

export default function Contacto() {
  const [params] = useSearchParams()
  const cursoInicial = params.get('curso') || ''
  const [sent, setSent] = useState(false)

  // Sin backend por ahora: abre el cliente de correo con el mensaje armado.
  // Más adelante se puede reemplazar por Supabase o un servicio de formularios.
  const onSubmit = (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const asunto = f.get('curso') ? `Consulta: ${f.get('curso')}` : 'Consulta desde el sitio'
    const cuerpo = `Nombre: ${f.get('nombre')}\nEmail: ${f.get('email')}\nTeléfono: ${f.get('telefono') || '-'}\n\n${f.get('mensaje')}`
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`
    setSent(true)
  }

  return (
    <>
      <PageHeader title="Contacto" subtitle="Escribinos y te respondemos a la brevedad." />
      <section className="section container contact">
        <form className="form" onSubmit={onSubmit}>
          <label>
            Nombre
            <input name="nombre" type="text" required autoComplete="name" />
          </label>
          <label>
            Email
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Teléfono (opcional)
            <input name="telefono" type="tel" autoComplete="tel" />
          </label>
          <label>
            Curso de interés (opcional)
            <input name="curso" type="text" defaultValue={cursoInicial} />
          </label>
          <label>
            Mensaje
            <textarea name="mensaje" rows="5" required />
          </label>
          <button type="submit" className="btn btn--primary">Enviar consulta</button>
          {sent && (
            <p className="form__ok" role="status">
              Se abrió tu aplicación de correo con el mensaje listo para enviar.
            </p>
          )}
        </form>

        <aside className="contact__info">
          <h2>Datos de contacto</h2>
          <ul>
            <li><Mail size={20} /> <a href={`mailto:${site.email}`}>{site.email}</a></li>
            <li><Phone size={20} /> <a href={`tel:${site.phone.replace(/[^+\d]/g, '')}`}>{site.phone}</a></li>
            <li><MapPin size={20} /> {site.address}</li>
          </ul>
        </aside>
      </section>
    </>
  )
}
