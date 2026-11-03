export default function PageHeader({ title, subtitle, compact = false }) {
  return (
    <section className={`page-header ${compact ? 'page-header--compact' : ''}`}>
      <div className="container">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  )
}
