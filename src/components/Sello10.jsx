import { useId } from 'react'

const estrella = (cx, cy, r) => {
  const p = []
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 ? r * 0.42 : r
    p.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`)
  }
  return p.join(' ')
}

function hojas() {
  const out = []
  const C = 100, R = 68
  for (let k = 0; k < 12; k++) {
    const t = 98 + k * 10
    for (const lado of [1, -1]) {
      for (const cara of [1, -1]) {
        const ang = lado === 1 ? t : 180 - t
        const rad = (ang * Math.PI) / 180
        const rr = R + cara * 6.5
        const x = C + rr * Math.cos(rad)
        const y = C + 8 + rr * Math.sin(rad)
        const rot = ang + (lado === 1 ? -1 : 1) * cara * 28
        const esc = 0.75 + 0.25 * (1 - k / 12)
        out.push(
          <ellipse key={`${k}-${lado}-${cara}`} cx={x.toFixed(1)} cy={y.toFixed(1)} rx={(4.2 * esc).toFixed(1)} ry={(11 * esc).toFixed(1)}
            transform={`rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`} />
        )
      }
    }
  }
  return out
}

export default function Sello10({ className = '' }) {
  const gid = 's10g' + useId().replace(/:/g, '')
  return (
    <svg className={className} viewBox="0 0 200 210" role="img" aria-label="10 años" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7e68b0" />
          <stop offset="1" stopColor="#4b3a72" />
        </linearGradient>
      </defs>
      <g fill={`url(#${gid})`}>
        {hojas()}
        <polygon points={estrella(100, 22, 12)} />
        <polygon points={estrella(70, 30, 8.5)} />
        <polygon points={estrella(130, 30, 8.5)} />
        <polygon points={estrella(46, 46, 6.5)} />
        <polygon points={estrella(154, 46, 6.5)} />
        <text x="100" y="124" textAnchor="middle" fontSize="92" fontWeight="900" fontFamily="Inter, Arial, sans-serif" letterSpacing="-6">10</text>
      </g>
      <rect x="40" y="136" width="120" height="38" rx="8" fill="#4b3a72" stroke="#fff" strokeWidth="3" />
      <text x="100" y="164" textAnchor="middle" fontSize="28" fontWeight="800" letterSpacing="5" fill="#fff" fontFamily="Inter, Arial, sans-serif">AÑOS</text>
    </svg>
  )
}
