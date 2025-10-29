import { ChangeEvent } from 'react'
import { useWizard } from '../hooks/useWizard'

const Dashboards = () => {
  const {
    state,
    dashboardTemplates,
    selectDashboardTemplate,
    toggleDashboardWidget,
    updateDashboardTarget,
  } = useWizard()
  const { dashboards } = state

  const selectedTemplate = dashboardTemplates.find(
    (template) => template.id === dashboards.selectedTemplate,
  )

  const handleTargetChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateDashboardTarget(event.target.value)
  }

  return (
    <div className="view-stack">
      <section className="card">
        <header className="card-header">
          <h3>Choose a dashboard base</h3>
          <p>
            Start from a curated composition designed around your goals. You can always refine the layout
            after publishing.
          </p>
        </header>

        <div className="card-body dashboard-templates">
          {dashboardTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              className={classNames(
                'template-card',
                dashboards.selectedTemplate === template.id && 'active',
              )}
              onClick={() => selectDashboardTemplate(template.id)}
            >
              <header>
                <h4>{template.name}</h4>
              </header>
              <p>{template.description}</p>
              <div className="template-highlights">
                {template.highlights.map((highlight) => (
                  <span key={highlight}>{highlight}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <header className="card-header">
          <h3>Widget lineup</h3>
          <p>
            Toggle the cards that should appear on day one. We’ll wire them to the helpers and rooms you’ve
            set up.
          </p>
        </header>

        <div className="card-body widget-grid">
          {dashboards.widgets.map((widget) => (
            <div key={widget.id} className="widget-card">
              <header>
                <div>
                  <strong>{widget.label}</strong>
                  <p>{widget.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={widget.enabled}
                  onChange={() => toggleDashboardWidget(widget.id)}
                />
              </header>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <header className="card-header">
          <h3>Publish destination</h3>
          <p>
            Pick the Lovelace dashboard slug where Magic Composer should deploy the generated layout and
            helpers.
          </p>
        </header>

        <div className="card-body">
          <div className="form-field">
            <label htmlFor="dashboard-target">Dashboard slug</label>
            <input
              id="dashboard-target"
              type="text"
              value={dashboards.publishTarget}
              onChange={handleTargetChange}
            />
            <span className="form-helper">
              Available under <code>/lovelace/{dashboards.publishTarget}</code> in Home Assistant.
            </span>
          </div>

          {selectedTemplate && (
            <div className="review-item">
              <h4>Selected template</h4>
              <p>{selectedTemplate.name}</p>
              <p className="form-helper">
                Highlights: {selectedTemplate.highlights.join(', ')}.
              </p>
            </div>
          )}

          <div className="cta-row">
            <button type="button" className="primary">
              Preview dashboard YAML
            </button>
            <button type="button" className="secondary">
              Export to UI editor
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

const classNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

export default Dashboards
