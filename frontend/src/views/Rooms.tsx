import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import { useRooms } from '../hooks/useRooms'

const purposeOptions = [
  'Zona giorno',
  'Cucina',
  'Camera da letto',
  'Bagno',
  'Studio',
  'Esterno',
  'Locale tecnico',
  'Altro',
]

const defaultFormState = {
  name: '',
  floor: 'Piano terra',
  purpose: 'Zona giorno',
  notes: '',
  devices: '',
}

const sanitizeList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const Rooms = () => {
  const { rooms, addRoom, updateRoom, removeRoom } = useRooms()
  const [formState, setFormState] = useState(defaultFormState)

  const totalDevices = useMemo(
    () => rooms.reduce((count, room) => count + room.devices.length, 0),
    [rooms],
  )

  const handleFormChange =
    (field: keyof typeof defaultFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFormState((previous) => ({
        ...previous,
        [field]: event.target.value,
      }))
    }

  const handleAddRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = formState.name.trim()

    if (!name) {
      return
    }

    addRoom({
      name,
      floor: formState.floor.trim() || 'Piano terra',
      purpose: formState.purpose,
      notes: formState.notes.trim(),
      devices: sanitizeList(formState.devices),
    })

    setFormState(defaultFormState)
  }

  const handleRoomFieldChange =
    (roomId: string, field: 'name' | 'floor' | 'purpose' | 'notes') =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      updateRoom(roomId, { [field]: event.target.value })
    }

  const handleRoomDevicesChange = (roomId: string) => (event: ChangeEvent<HTMLTextAreaElement>) => {
    updateRoom(roomId, { devices: sanitizeList(event.target.value) })
  }

  return (
    <div className="rooms-view">
      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>Le tue stanze</h2>
            <p>
              Gestisci ogni ambiente con descrizioni chiare e l&apos;elenco dei dispositivi presenti. Puoi
              aggiornare i dati in qualsiasi momento.
            </p>
          </div>
          <div className="summary">
            <div>
              <span className="summary-label">Stanze</span>
              <span className="summary-value">{rooms.length}</span>
            </div>
            <div>
              <span className="summary-label">Dispositivi tracciati</span>
              <span className="summary-value">{totalDevices}</span>
            </div>
          </div>
        </header>

        {rooms.length === 0 ? (
          <div className="empty-state">
            <h3>Nessuna stanza registrata</h3>
            <p>Aggiungi la prima stanza utilizzando il modulo qui sotto.</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {rooms.map((room) => (
              <article key={room.id} className="room-card">
                <div className="room-card-header">
                  <input
                    className="room-title"
                    value={room.name}
                    onChange={handleRoomFieldChange(room.id, 'name')}
                    placeholder="Nome stanza"
                    aria-label="Nome stanza"
                  />
                  <button type="button" className="delete-button" onClick={() => removeRoom(room.id)}>
                    Elimina
                  </button>
                </div>

                <div className="room-fields">
                  <label className="field">
                    <span>Piano</span>
                    <input
                      value={room.floor}
                      onChange={handleRoomFieldChange(room.id, 'floor')}
                      placeholder="Es. Primo piano"
                    />
                  </label>

                  <label className="field">
                    <span>Uso prevalente</span>
                    <select value={room.purpose} onChange={handleRoomFieldChange(room.id, 'purpose')}>
                      {purposeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="field">
                  <span>Note o dettagli</span>
                  <textarea
                    rows={3}
                    value={room.notes}
                    onChange={handleRoomFieldChange(room.id, 'notes')}
                    placeholder="Annota particolarità, orari o preferenze"
                  />
                </label>

                <label className="field">
                  <span>Dispositivi associati</span>
                  <textarea
                    rows={2}
                    value={room.devices.join(', ')}
                    onChange={handleRoomDevicesChange(room.id)}
                    placeholder="Luci, sensori, clima, ecc."
                  />
                  <span className="field-helper">Separa i dispositivi con una virgola.</span>
                </label>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>Aggiungi una nuova stanza</h2>
            <p>Compila i campi e salva per inserire l&apos;ambiente nella lista.</p>
          </div>
        </header>

        <form className="room-form" onSubmit={handleAddRoom}>
          <label className="field">
            <span>Nome stanza</span>
            <input
              value={formState.name}
              onChange={handleFormChange('name')}
              placeholder="Es. Soggiorno"
              required
            />
          </label>

          <div className="form-row">
            <label className="field">
              <span>Piano</span>
              <input
                value={formState.floor}
                onChange={handleFormChange('floor')}
                placeholder="Es. Piano terra"
              />
            </label>

            <label className="field">
              <span>Uso prevalente</span>
              <select value={formState.purpose} onChange={handleFormChange('purpose')}>
                {purposeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            <span>Note o dettagli</span>
            <textarea
              rows={3}
              value={formState.notes}
              onChange={handleFormChange('notes')}
              placeholder="Descrivi particolarità dell'ambiente"
            />
          </label>

          <label className="field">
            <span>Dispositivi associati</span>
            <textarea
              rows={2}
              value={formState.devices}
              onChange={handleFormChange('devices')}
              placeholder="Es. Luci soffitto, Sensore movimento"
            />
            <span className="field-helper">Separa i dispositivi con una virgola.</span>
          </label>

          <div className="actions">
            <button type="submit" className="primary-button">
              Salva stanza
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default Rooms
