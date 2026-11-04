import { User } from 'lucide-react'

// Foto circular con contorno violeta + aro lavanda. Sin foto, muestra un círculo con ícono.
export default function PersonaFoto({ url, nombre, className = '' }) {
  return (
    <span className={`pfoto ${className}`}>
      {url ? <img src={url} alt={`Foto de ${nombre}`} loading="lazy" decoding="async" /> : <User size="42%" aria-hidden="true" />}
    </span>
  )
}
