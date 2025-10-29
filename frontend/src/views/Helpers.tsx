import { useMemo } from 'react'
import { useWizard } from '../hooks/useWizard'

const categoryOrder = ['Automation', 'Energy', 'Comfort', 'Security']

const Helpers = () => {
  const { state, toggleHelper } = useWizard()

  const groupedHelpers = useMemo(() => {
    const groups = new Map<string, typeof state.helpers>()
    for (const helper of state.helpers) {
      const group = groups.get(helper.category) ?? []
      group.push(helper)
      groups.set(helper.category, group)
    }
    return categoryOrder
      .filter((category) => groups.has(category))
      .map((category) => ({
        category,
        helpers: groups.get(category) ?? [],
      }))
  }, [state.helpers])

  const enabledCount = state.helpers.filter((helper) => helper.enabled).length

  return (
    <div className="view-stack">
      <section className="card">
        <header className="card-header">
          <h3>Helper library</h3>
          <p>
            Helpers provide the glue between sensors, scripts, and dashboards. Toggle the routines that
            should ship with the initial blueprint.
          </p>
        </header>

        <div className="card-body">
          <div className="status-grid">
            <div className="status-card">
              <span className="status-icon" aria-hidden>⚙️</span>
              <div>
                <p className="status-label">Active helpers</p>
                <p className="status-value">{enabledCount}</p>
              </div>
              <span className="status-sub">Recommended: 3 to 6 key helpers to keep things focused.</span>
            </div>
          </div>
        </div>
      </section>

      {groupedHelpers.map((group) => (
        <section key={group.category} className="card">
          <header className="card-header">
            <h3>{group.category}</h3>
            <p>
              {group.category === 'Automation' && 'Create foundational routines and scheduling helpers.'}
              {group.category === 'Energy' && 'Optimise consumption, tariffs, and load shifting automatically.'}
              {group.category === 'Comfort' &&
                'Keep rooms pleasant with adaptive climate, air quality, and lighting helpers.'}
              {group.category === 'Security' && 'Strengthen safety with presence-aware protections and routines.'}
            </p>
          </header>

          <div className="card-body toggle-group">
            {group.helpers.map((helper) => (
              <div key={helper.id} className="toggle-tile">
                <div>
                  <label htmlFor={helper.id}>{helper.name}</label>
                  <span>{helper.description}</span>
                </div>
                <input
                  id={helper.id}
                  type="checkbox"
                  checked={helper.enabled}
                  onChange={() => toggleHelper(helper.id)}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default Helpers
