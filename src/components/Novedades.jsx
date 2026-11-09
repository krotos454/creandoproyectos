import { useId } from 'react'
import { ArrowRight, Bell, CirclePlay, Clock3, MessageCircle, X } from 'lucide-react'
import { Link } from 'react-router-dom'

function AulaAsincronica() {
  const ids = useId().replaceAll(':', '')
  const pantallaId = `screen-${ids}`
  const mesaId = `desk-${ids}`
  const sombraId = `shadow-${ids}`
  return (
    <div className="asincronica-visual" aria-hidden="true">
      <div className="asincronica-visual__halo" />
      <div className="asincronica-visual__badge"><Clock3 size={15} /> A TU RITMO</div>
      <svg className="asincronica-visual__ilustracion" viewBox="0 0 460 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={pantallaId} x1="113" y1="55" x2="342" y2="235" gradientUnits="userSpaceOnUse"><stop stopColor="#fff"/><stop offset="1" stopColor="#e7def4"/></linearGradient>
          <linearGradient id={mesaId} x1="70" y1="236" x2="415" y2="283" gradientUnits="userSpaceOnUse"><stop stopColor="#fff"/><stop offset="1" stopColor="#e8e0f2"/></linearGradient>
          <filter id={sombraId} x="48" y="35" width="378" height="263" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="11"/></filter>
        </defs>
        <ellipse cx="242" cy="269" rx="167" ry="18" fill="#3F2D63" fillOpacity=".12" filter={`url(#${sombraId})`}/>
        <circle cx="342" cy="78" r="40" fill="#fff" fillOpacity=".28"/><circle cx="77" cy="133" r="18" fill="#fff" fillOpacity=".34"/>
        <rect x="89" y="41" width="278" height="180" rx="16" fill="#fff" fillOpacity=".38"/><rect x="101" y="49" width="253" height="160" rx="12" fill="#51406F"/>
        <rect x="108" y="56" width="239" height="146" rx="8" fill={`url(#${pantallaId})`}/><path d="M108 64a8 8 0 0 1 8-8h223a8 8 0 0 1 8 8v14H108V64Z" fill="#d8cce9"/>
        <circle cx="120" cy="67" r="3" fill="#fff"/><circle cx="131" cy="67" r="3" fill="#fff"/><circle cx="142" cy="67" r="3" fill="#fff"/>
        <rect x="119" y="91" width="94" height="68" rx="8" fill="#cfc1e3"/><circle cx="166" cy="113" r="14" fill="#e7b89e"/><path d="M151 111c1-15 28-21 31 0-7-4-18-4-31 0Z" fill="#453650"/><path d="M141 153c2-20 12-27 25-27s24 8 26 27" fill="#816caa"/>
        <rect x="225" y="94" width="99" height="7" rx="3.5" fill="#786698" fillOpacity=".76"/><rect x="225" y="108" width="81" height="5" rx="2.5" fill="#a99bc9"/><rect x="225" y="119" width="91" height="5" rx="2.5" fill="#c9bfda"/><rect x="225" y="139" width="62" height="20" rx="10" fill="#6b5a91"/><path d="m251 145 8 4-8 5v-9Z" fill="#fff"/>
        <path d="M77 221h302l30 28H50l27-28Z" fill={`url(#${mesaId})`} stroke="#d5c9e7" strokeWidth="2"/><path d="M50 249h359v10c0 7-6 12-13 12H64c-8 0-14-5-14-12v-10Z" fill="#cfc3e1"/>
        <circle cx="375" cy="204" r="31" fill="#fff" fillOpacity=".9"/><circle cx="375" cy="204" r="22" fill="#6b5a91"/><path d="m371 195 14 9-14 9v-18Z" fill="#fff"/>
      </svg>
      <div className="asincronica-visual__caption"><CirclePlay size={16} /> Clases para ver cuando quieras</div>
    </div>
  )
}

function BotonConsulta({ noticia, onClick }) {
  const contenido = <>{noticia.tipo_boton === 'curso' ? 'Ver curso ahora' : <><MessageCircle size={18} /> Consultar por WhatsApp</>}{noticia.tipo_boton === 'curso' && <ArrowRight size={17} />}</>
  return noticia.tipo_boton === 'curso'
    ? <Link className="novedad-cta novedad-cta--grande" to={noticia.enlace} onClick={onClick}>{contenido}</Link>
    : <a className="novedad-cta novedad-cta--grande" href={noticia.enlace} target="_blank" rel="noopener noreferrer" onClick={onClick}>{contenido}</a>
}

function ImagenNovedad({ noticia, className }) {
  return noticia.imagen_url
    ? <img className={className} src={noticia.imagen_url} alt={noticia.titulo} />
    : <AulaAsincronica />
}

export function NovedadAviso({ noticia, onCerrar }) {
  const esFlyer = noticia.formato_imagen === 'flyer'
  return (
    <div className="novedad-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <section className={`novedad-aviso ${esFlyer ? 'novedad-aviso--flyer' : ''}`} role="dialog" aria-modal="true" aria-labelledby="novedad-aviso-titulo">
        <button className="novedad-aviso__cerrar" type="button" onClick={onCerrar} aria-label="Cerrar aviso"><X size={19} /></button>
        <div className="novedad-aviso__contenido"><span className="novedad__etiqueta"><Bell size={13} /> {noticia.etiqueta}</span><p className="novedad-aviso__sobrelinea">ESTUDIÁ A TU RITMO</p><h2 id="novedad-aviso-titulo">{noticia.titulo}</h2><p className="novedad-aviso__descripcion">{noticia.descripcion}</p><BotonConsulta noticia={noticia} onClick={onCerrar} /></div>
        <div className={`novedad-aviso__arte ${esFlyer ? 'novedad-aviso__arte--flyer' : ''}`}><ImagenNovedad noticia={noticia} className="novedad__imagen" /></div>
      </section>
    </div>
  )
}

export default function Novedades({ noticia }) {
  if (!noticia) return null
  const esFlyer = noticia.formato_imagen === 'flyer'
  return <section className="novedades container" id="novedades" aria-labelledby="novedades-titulo">
      <h2 className="sr-only" id="novedades-titulo">Novedades</h2>
      <div className="novedades__lista"><article className={`novedad-card ${esFlyer ? 'novedad-card--flyer' : ''}`}>
        <div className="novedad-card__contenido"><span className="novedad-card__marca"><Bell size={17} /> Novedades</span><p className="novedad-card__sobrelinea">ESTUDIÁ A TU RITMO</p><h3>{noticia.titulo}</h3><p className="novedad-card__descripcion">{noticia.descripcion}</p><BotonConsulta noticia={noticia} /></div>
        <div className={`novedad-card__arte ${esFlyer ? 'novedad-card__arte--flyer' : ''}`}><ImagenNovedad noticia={noticia} className="novedad__imagen" /></div>
      </article></div>
    </section>
}
