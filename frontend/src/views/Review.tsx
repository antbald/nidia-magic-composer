import { useMemo } from 'react'
import { useWizard } from '../hooks/useWizard'

const Review = () => {
  const { state } = useWizard()
  const { profile, rooms, map, helpers, dashboards } = state

  const pendingItems = useMemo(() => {
    const items: string[] = []
    if (!map.blueprintReady) {
      items.push('Upload the floor plan blueprint.')
    }
    if (!map.zonesDefined) {
      items.push('Map every room to a Home Assistant area.')
    }
    if (!helpers.some((helper) => helper.enabled)) {
      items.push('Enable at least one helper to automate routines.')
    }
    if (!dashboards.widgets.some((widget) => widget.enabled)) {
      items.push('Select dashboard widgets to publish.')
    }
    return items
  }, [map, helpers, dashboards])

  const enabledHelpers = helpers.filter((helper) => helper.enabled)
  const widgetsEnabled = dashboards.widgets.filter((widget) => widget.enabled)

  return (
    <div className="view-stack">
      <section className="card">
        <header className="card-header">
          <h3>Blueprint summary</h3>
          <p>
            Double-check that everything looks right. When you publish, we’ll generate helpers, dashboards,
            and automation blueprints tailored to this profile.
          </p>
        </header>

        <div className="card-body review-grid">
          <div className="review-item">
            <h4>Profile</h4>
            <p>{profile.name}</p>
            <p className="form-helper">
              {profile.homeType} • {profile.floors} floor{profile.floors > 1 ? 's' : ''} •{' '}
              {profile.timezone} • Locale {profile.locale}
            </p>
          </div>

          <div className="review-item">
            <h4>Rooms & coverage</h4>
            <p>{rooms.length} rooms planned</p>
            <p className="form-helper">
              {rooms.slice(0, 3).map((room) => room.name).join(', ')}
              {rooms.length > 3 ? ` +${rooms.length - 3} more` : ''}
            </p>
          </div>

          <div className="review-item">
            <h4>Helpers</h4>
            <p>{enabledHelpers.length} helpers enabled</p>
            <p className="form-helper">
              {enabledHelpers.length > 0
                ? enabledHelpers.map((helper) => helper.name).join(', ')
                : 'Select helpers to automate your routines.'}
            </p>
          </div>

          <div className="review-item">
            <h4>Dashboard</h4>
            <p>{dashboards.publishTarget}</p>
            <p className="form-helper">
              Template: {dashboards.selectedTemplate} • Widgets:{' '}
              {widgetsEnabled.map((widget) => widget.label).join(', ') || 'None selected'}
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <header className="card-header">
          <h3>Pre-flight checklist</h3>
          <p>Resolve any outstanding items to ensure a smooth deployment.</p>
        </header>

        <div className="card-body">
          {pendingItems.length ? (
            <ul>
              {pendingItems.map((item) => (
                <li key={item} className="form-helper">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <p>Everything looks good. You’re ready to publish the Magic Composer blueprint.</p>
            </div>
          )}
        </div>
      </section>

      <section className="card">
        <header className="card-header">
          <h3>Next actions</h3>
          <p>Generate the automation blueprint and optionally export it for version control.</p>
        </header>

        <div className="card-body">
          <div className="cta-row">
            <button type="button" className="primary">
              Generate blueprint & publish
            </button>
            <button type="button" className="secondary">
              Download manifest
            </button>
            <button type="button" className="secondary">
              Save draft for review
            </button>
          </div>

          <p className="form-helper">
            Publishing pushes helpers and dashboards into Home Assistant. You can roll back from the
            changelog if something doesn’t feel right.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Review
