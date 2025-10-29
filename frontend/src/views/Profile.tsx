import { ChangeEvent } from 'react'
import { useWizard } from '../hooks/useWizard'

const homeTypes = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'detached', label: 'Detached house' },
  { value: 'semi-detached', label: 'Semi-detached' },
  { value: 'villa', label: 'Villa' },
  { value: 'loft', label: 'Loft / studio' },
]

const timezoneOptions = [
  'Europe/Rome',
  'Europe/Paris',
  'Europe/London',
  'Europe/Madrid',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
]

const localeOptions = [
  'it-IT',
  'en-GB',
  'en-US',
  'fr-FR',
  'es-ES',
  'de-DE',
]

const priorityOptions = ['Comfort', 'Automation', 'Energy savings', 'Security', 'Accessibility']

const Profile = () => {
  const { state, updateProfile } = useWizard()
  const profile = state.profile

  const handleChange =
    (field: 'name' | 'homeType' | 'timezone' | 'locale' | 'energyMode' | 'notes') =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = event.target.value
      updateProfile({ [field]: value })
    }

  const handleNumberChange =
    (field: 'floors') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value) || 0
      updateProfile({ [field]: value })
    }

  const togglePriority = (priority: string) => {
    const priorities = new Set(profile.priorities)
    if (priorities.has(priority)) {
      priorities.delete(priority)
    } else {
      priorities.add(priority)
    }
    updateProfile({ priorities: Array.from(priorities) })
  }

  const toggleAdvanced = () => {
    updateProfile({ enableAdvanced: !profile.enableAdvanced })
  }

  return (
    <div className="view-stack">
      <section className="card">
        <header className="card-header">
          <h3>House identity</h3>
          <p>Define how Home Assistant should refer to this property and tailor automations to its structure.</p>
        </header>

        <div className="card-body">
          <div className="form-grid two-column">
            <div className="form-field">
              <label htmlFor="profile-name">Profile name</label>
              <input
                id="profile-name"
                type="text"
                placeholder="e.g. Casa Principale"
                value={profile.name}
                onChange={handleChange('name')}
              />
              <span className="form-helper">Used across dashboards, automations, and notifications.</span>
            </div>

            <div className="form-field">
              <label htmlFor="profile-type">Home type</label>
              <select
                id="profile-type"
                value={profile.homeType}
                onChange={handleChange('homeType')}
              >
                {homeTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="form-helper">We’ll use this to recommend sensors and helper entities.</span>
            </div>

            <div className="form-field">
              <label htmlFor="profile-floors">Floors</label>
              <input
                id="profile-floors"
                type="number"
                min={1}
                value={profile.floors}
                onChange={handleNumberChange('floors')}
              />
              <span className="form-helper">Include basement or roof levels if they need automation coverage.</span>
            </div>

            <div className="form-field">
              <label htmlFor="profile-timezone">Timezone</label>
              <select
                id="profile-timezone"
                value={profile.timezone}
                onChange={handleChange('timezone')}
              >
                {timezoneOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="profile-locale">Locale</label>
              <select
                id="profile-locale"
                value={profile.locale}
                onChange={handleChange('locale')}
              >
                {localeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="form-helper">Determines translations and dashboards formatting.</span>
            </div>

            <div className="form-field">
              <label>Energy profile</label>
              <div className="chip-group">
                {(['balanced', 'eco', 'comfort'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={classNames('chip', profile.energyMode === mode && 'active')}
                    onClick={() => updateProfile({ energyMode: mode })}
                  >
                    {mode === 'balanced' ? 'Balanced' : mode === 'eco' ? 'Energy saver' : 'Comfort first'}
                  </button>
                ))}
              </div>
              <span className="form-helper">
                Impacts automation defaults for climate, lighting, and energy routines.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <header className="card-header">
          <h3>Automation goals</h3>
          <p>Select what matters most so we can suggest the right helpers, dashboards, and blueprints.</p>
        </header>

        <div className="card-body">
          <div className="chip-group">
            {priorityOptions.map((priority) => (
              <button
                key={priority}
                type="button"
                className={classNames('chip', profile.priorities.includes(priority) && 'active')}
                onClick={() => togglePriority(priority)}
              >
                {priority}
              </button>
            ))}
          </div>

          <div className="form-field">
            <label htmlFor="profile-notes">Notes for the composer</label>
            <textarea
              id="profile-notes"
              placeholder="Describe comfort expectations, occupancy patterns, or devices that must be prioritised."
              value={profile.notes}
              onChange={handleChange('notes')}
            />
            <span className="form-helper">These notes appear in the review step and generated documentation.</span>
          </div>

          <div className="toggle-group">
            <div className="toggle-tile">
              <label htmlFor="profile-advanced">Enable advanced tuning</label>
              <span>Expose experimental helpers, scenes, and scripting slots.</span>
              <input
                id="profile-advanced"
                type="checkbox"
                checked={profile.enableAdvanced}
                onChange={toggleAdvanced}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const classNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

export default Profile
