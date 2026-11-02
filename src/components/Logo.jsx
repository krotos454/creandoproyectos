import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { site } from '../config/site.js'

export default function Logo({ light = false }) {
  return (
    <Link to="/" className={`logo ${light ? 'logo--light' : ''}`} aria-label={`${site.name} - Inicio`}>
      <span className="logo__mark">
        <GraduationCap size={24} strokeWidth={2.2} />
      </span>
      <span className="logo__text">
        <strong>{site.name}</strong>
        <small>{site.tagline}</small>
      </span>
    </Link>
  )
}
