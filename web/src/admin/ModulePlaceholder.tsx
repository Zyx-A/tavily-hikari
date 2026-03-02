interface ModulePlaceholderProps {
  title: string
  description: string
  sections: string[]
  comingSoonLabel: string
}

export default function ModulePlaceholder({
  title,
  description,
  sections,
  comingSoonLabel,
}: ModulePlaceholderProps): JSX.Element {
  return (
    <section className="surface panel module-placeholder">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          <p className="panel-description">{description}</p>
        </div>
      </div>
      <div className="module-placeholder-grid">
        {sections.map((section) => (
          <article key={section} className="module-placeholder-card">
            <h3>{section}</h3>
            <p className="panel-description">{comingSoonLabel}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
