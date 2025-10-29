import { ChangeEvent } from 'react'
import { useWizard } from '../hooks/useWizard'

const mapTasks = [
  {
    key: 'blueprintReady' as const,
    label: 'Upload floor plan blueprint',
    description: 'Add a scaled image or PDF so we can overlay Home Assistant areas.',
    action: 'Upload blueprint',
  },
  {
    key: 'zonesDefined' as const,
    label: 'Link rooms to areas',
    description: 'Confirm or adjust each room’s Home Assistant area mapping.',
    action: 'Open area mapper',
  },
  {
    key: 'automationsPreview' as const,
    label: 'Generate automation preview',
    description: 'Simulate pathway lighting, occupancy flows, and energy guards.',
    action: 'Preview automations',
  },
]

const Map = () => {
  const { state, updateMap } = useWizard()
  const { map } = state

  const completed = mapTasks.filter((task) => map[task.key]).length
  const progress = Math.round((completed / mapTasks.length) * 100)

  const handleToggle =
    (key: keyof typeof map) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      updateMap({ [key]: event.target.checked })
    }

  const handleNotesChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    updateMap({ notes: event.target.value })
  }

  return (
    <div className="view-stack">
      <section className="card">
        <header className="card-header">
          <h3>Spatial mapping progress</h3>
          <p>
            Keep the digital floor plan aligned with real-world layouts to power adaptive lighting,
            security patrols, and energy zoning.
          </p>
        </header>

        <div className="card-body">
          <div className="progress">
            <div className="progress-meta">
              <span>Spatial configuration</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar">
              <span style={{ width: `${progress}%` }} />
            </div>
            <p className="progress-helper">
              {completed} of {mapTasks.length} spatial tasks completed
            </p>
          </div>

          <div className="toggle-group">
            {mapTasks.map((task) => (
              <div key={task.key} className="toggle-tile">
                <div>
                  <label htmlFor={task.key}>{task.label}</label>
                  <span>{task.description}</span>
                </div>
                <div className="cta-row">
                  <button type="button" className="secondary">
                    {task.action}
                  </button>
                  <input
                    id={task.key}
                    type="checkbox"
                    checked={map[task.key]}
                    onChange={handleToggle(task.key)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <header className="card-header">
          <h3>Notes and special instructions</h3>
          <p>Call out zones that require bespoke logic or safety rules before we generate automations.</p>
        </header>

        <div className="card-body">
          <div className="form-field">
            <label htmlFor="map-notes">Spatial notes</label>
            <textarea
              id="map-notes"
              placeholder="e.g. Disable vacuum in nursery after 21:00. Link patio presence to living room scene at sunset."
              value={map.notes}
              onChange={handleNotesChange}
            />
          </div>

          <div className="cta-row">
            <button type="button" className="primary">
              Launch spatial editor
            </button>
            <button type="button" className="secondary">
              Import from Matter map
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Map
