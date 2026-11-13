import { Link } from 'react-router-dom'
import { site } from '../config/site.js'

export default function Logo({ light = false }) {
  return (
    <Link to="/" className={`logo ${light ? 'logo--light' : ''}`} aria-label={`${site.name} - Inicio`}>
      <span className="logo__mark">
        <img src="/logo-144.png" srcSet="/logo-144.png 1x, /logo-288.png 2x" alt="" width="48" height="48" decoding="async" />
      </span>
      <span className="logo__text">
        <strong>{site.name}</strong>
        <small>{site.tagline}</small>
      </span>
    </Link>
  )
}
