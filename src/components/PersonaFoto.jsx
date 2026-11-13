import { User } from 'lucide-react'

export default function PersonaFoto({ url, nombre, className = '' }) {
  return (
    <span className={`pfoto ${className}`}>
      {url ? <img src={url} alt={`Foto de ${nombre}`} loading="lazy" decoding="async" /> : <User size="42%" aria-hidden="true" />}
    </span>
  )
}
