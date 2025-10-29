import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import { useWizard } from '../hooks/useWizard'

const purposeOptions = [
  'Living',
  'Kitchen',
  'Bedroom',
  'Bathroom',
  'Office',
  'Outdoor',
  'Utility',
  'Custom',
]

const baseFloorLabels = [
  'Ground floor',
  'First floor',
  'Second floor',
  'Third floor',
  'Fourth floor',
  'Fifth floor',
]

const defaultDraft = {
  name: '',
  floor: 'Ground floor',
  purpose: 'Living',
  coverage: '',
  devices: '',
}

const Rooms = () => {
  const { state, addRoom, updateRoom, removeRoom } = useWizard()
  const [draftRoom, setDraftRoom] = useState(defaultDraft)

  const floorOptions = useMemo(() => {
    const floors = Math.max(state.profile.floors, 1)
    const labels = baseFloorLabels.slice(0, floors)
    if (floors > baseFloorLabels.length) {
      for (let index = baseFloorLabels.length; index < floors; index += 1) {
        labels.push(`Floor ${index}`)
      }
    }
    const additionalFloors = state.rooms
      .map((room) => room.floor)
      .filter((floor) => !labels.includes(floor))
    return [...labels, ...additionalFloors]
  }, [state.profile.floors, state.rooms])

  const handleDraftChange =
    (field: keyof typeof defaultDraft) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setDraftRoom((prev) => ({
        ...prev,
        [field]: event.target.value,
      }))
    }

  const handleAddRoom = (event: FormEvent) => {
    event.preventDefault()
    if (!draftRoom.name.trim()) {
      return
    }

    addRoom({
      name: draftRoom.name.trim(),
      floor: draftRoom.floor,
      purpose: draftRoom.purpose,
      coverage: draftRoom.coverage.trim() || 'General coverage',
      devices: draftRoom.devices
        .split(',')
        .map((device) => device.trim())
        .filter(Boolean),
    })

    setDraftRoom(defaultDraft)
  }

  const handleDeviceChange =
    (roomId: string) =>
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const devices = event.target.value
        .split(',')
        .map((device) => device.trim())
        .filter(Boolean)
      updateRoom(roomId, { devices })
    }

  return (
    <div className="view-stack">
      <section className="card">
        <header className="card-header">
          <h3>Rooms and functional areas</h3>
          <p>
            Map every room, shared space, and service area. We use these definitions to build helpers,
            dashboards, and automation scopes.
          </p>
        </header>

        <div className="card-body">
          {state.rooms.length === 0 ? (
            <div className="empty-state">
              <p>No rooms yet. Add your first room to start planning automation coverage.</p>
            </div>
          ) : (
            <div className="room-grid">
              {state.rooms.map((room) => (
                <div key={room.id} className="room-card">
                  <header>
                    <h4>{room.name}</h4>
                  </header>
                  <div className="room-meta">
                    <span>{room.floor}</span>
                    <span>•</span>
                    <span>{room.purpose}</span>
                  </div>
                  <div className="form-field">
                    <label>Purpose</label>
                    <select
                      value={room.purpose}
                      onChange={(event) => updateRoom(room.id, { purpose: event.target.value })}
                    >
                      {purposeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Devices & services</label>
                    <textarea
                      placeholder="Lighting, blinds, climate, sensors…"
                      value={room.devices.join(', ')}
                      onChange={handleDeviceChange(room.id)}
                    />
                    <span className="form-helper">
                      Separate with commas. We’ll recommend helpers based on your coverage.
                    </span>
                  </div>
                  <div className="form-field">
                    <label>Coverage notes</label>
                    <textarea
                      placeholder="Describe special areas or automation expectations."
                      value={room.coverage}
                      onChange={(event) =>
                        updateRoom(room.id, { coverage: event.target.value })
                      }
                    />
                  </div>

                  <div className="card-footer">
                    <span>Linked to {room.devices.length} devices</span>
                    <button type="button" onClick={() => removeRoom(room.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="card">
        <header className="card-header">
          <h3>Add another room</h3>
          <p>Keep going until every space that needs automation is mapped.</p>
        </header>

        <form className="card-body" onSubmit={handleAddRoom}>
          <div className="form-grid two-column">
            <div className="form-field">
              <label htmlFor="room-name">Room name</label>
              <input
                id="room-name"
                type="text"
                placeholder="e.g. Master bedroom"
                value={draftRoom.name}
                onChange={handleDraftChange('name')}
              />
            </div>

            <div className="form-field">
              <label htmlFor="room-floor">Floor</label>
              <select
                id="room-floor"
                value={draftRoom.floor}
                onChange={handleDraftChange('floor')}
              >
                {floorOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="room-purpose">Purpose</label>
              <select
                id="room-purpose"
                value={draftRoom.purpose}
                onChange={handleDraftChange('purpose')}
              >
                {purposeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="room-coverage">Coverage notes</label>
              <textarea
                id="room-coverage"
                placeholder="e.g. Include wardrobe lights and wardrobe contact sensor."
                value={draftRoom.coverage}
                onChange={handleDraftChange('coverage')}
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="room-devices">Devices</label>
            <textarea
              id="room-devices"
              placeholder="Lights, scenes, climate, sensors…"
              value={draftRoom.devices}
              onChange={handleDraftChange('devices')}
            />
            <span className="form-helper">
              Comma separated list of devices or services already available in this room.
            </span>
          </div>

          <div className="cta-row">
            <button type="submit" className="primary">
              Add room
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() =>
                addRoom({
                  name: 'Outdoor terrace',
                  floor: 'Outdoor',
                  purpose: 'Outdoor',
                  coverage: 'Accent lighting, awnings, speakers',
                  devices: ['Lighting', 'Awnings', 'Speakers'],
                })
              }
            >
              Quick add: outdoor area
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default Rooms
