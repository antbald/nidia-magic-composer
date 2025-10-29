import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useHassConnection } from '../hooks/useHassConnection'

type Area = {
  id: string
  name: string
}

type AreaListResponse = {
  areas: Area[]
}

type AreaMutationResponse = {
  area: Area
}

type AreaDeleteResponse = {
  success: boolean
  area_id: string
}

const WS_TYPE_AREAS_LIST = 'nidia_magic_composer/areas/list'
const WS_TYPE_AREAS_CREATE = 'nidia_magic_composer/areas/create'
const WS_TYPE_AREAS_UPDATE = 'nidia_magic_composer/areas/update'
const WS_TYPE_AREAS_DELETE = 'nidia_magic_composer/areas/delete'

function toErrorMessage(error: unknown, fallback: string): string {
  if (!error) {
    return fallback
  }

  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message || fallback
  }

  if (typeof error === 'object') {
    const message =
      (error as { message?: string }).message ??
      (error as { error?: { message?: string } }).error?.message
    if (message) {
      return message
    }
    const code = (error as { code?: string }).code
    if (code) {
      return `${fallback} (${code})`
    }
  }

  return fallback
}

const Rooms: React.FC = () => {
  const connection = useHassConnection()
  const [areas, setAreas] = useState<Area[]>([])
  const [selectedAreaId, setSelectedAreaId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isBusy, setIsBusy] = useState<boolean>(false)
  const [refreshCounter, setRefreshCounter] = useState(0)

  const selectedArea = useMemo(
    () => areas.find((area) => area.id === selectedAreaId) ?? null,
    [areas, selectedAreaId],
  )

  useEffect(() => {
    if (!connection) {
      setLoading(false)
      return
    }

    let isActive = true
    setLoading(true)
    setError(null)

    connection
      .sendMessagePromise<AreaListResponse>({ type: WS_TYPE_AREAS_LIST })
      .then((result) => {
        if (!isActive) {
          return
        }
        setAreas(result.areas)
        if (result.areas.every((area) => area.id !== selectedAreaId)) {
          setSelectedAreaId('')
        }
      })
      .catch((err) => {
        if (isActive) {
          setError(toErrorMessage(err, 'Failed to load rooms'))
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [connection, refreshCounter, selectedAreaId])

  const triggerRefresh = useCallback(
    () => setRefreshCounter((value) => value + 1),
    [],
  )

  const handleCreate = useCallback(async () => {
    if (!connection) {
      setError('Waiting for Home Assistant connection…')
      return
    }

    const name = window.prompt('Enter a name for the new room')
    if (!name) {
      return
    }

    setIsBusy(true)
    setError(null)

    try {
      await connection.sendMessagePromise<AreaMutationResponse>({
        type: WS_TYPE_AREAS_CREATE,
        name,
      })
      triggerRefresh()
    } catch (err) {
      setError(toErrorMessage(err, 'Failed to create room'))
    } finally {
      setIsBusy(false)
    }
  }, [connection, triggerRefresh])

  const handleRename = useCallback(async () => {
    if (!connection) {
      setError('Waiting for Home Assistant connection…')
      return
    }

    if (!selectedArea) {
      setError('Select a room to rename')
      return
    }

    const newName = window.prompt('Rename room', selectedArea.name)
    if (newName === null) {
      return
    }

    const normalizedName = newName.trim()
    if (!normalizedName) {
      setError('Room name cannot be empty')
      return
    }

    setIsBusy(true)
    setError(null)

    try {
      await connection.sendMessagePromise<AreaMutationResponse>({
        type: WS_TYPE_AREAS_UPDATE,
        area_id: selectedArea.id,
        name: normalizedName,
      })
      triggerRefresh()
    } catch (err) {
      setError(toErrorMessage(err, 'Failed to rename room'))
    } finally {
      setIsBusy(false)
    }
  }, [connection, selectedArea, triggerRefresh])

  const handleDelete = useCallback(async () => {
    if (!connection) {
      setError('Waiting for Home Assistant connection…')
      return
    }

    if (!selectedArea) {
      setError('Select a room to delete')
      return
    }

    const confirmed = window.confirm(
      `Delete room “${selectedArea.name}”? This cannot be undone.`,
    )
    if (!confirmed) {
      return
    }

    setIsBusy(true)
    setError(null)

    try {
      await connection.sendMessagePromise<AreaDeleteResponse>({
        type: WS_TYPE_AREAS_DELETE,
        area_id: selectedArea.id,
      })
      setSelectedAreaId('')
      triggerRefresh()
    } catch (err) {
      setError(toErrorMessage(err, 'Failed to delete room'))
    } finally {
      setIsBusy(false)
    }
  }, [connection, selectedArea, triggerRefresh])

  const disableActions = !connection || isBusy

  return (
    <div className="view-container">
      <h2>Room Management</h2>
      <p>Manage Home Assistant rooms directly from the Magic Composer wizard.</p>

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      <section className="rooms-panel">
        <div className="rooms-toolbar">
          <button
            type="button"
            onClick={handleCreate}
            disabled={disableActions}
            className="primary-button"
          >
            Create Room
          </button>
          <button
            type="button"
            onClick={handleRename}
            disabled={disableActions || !selectedArea}
          >
            Rename Room
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={disableActions || !selectedArea}
          >
            Delete Room
          </button>
        </div>

        <div className="rooms-list">
          <label htmlFor="room-select">Existing rooms</label>
          <select
            id="room-select"
            value={selectedAreaId}
            onChange={(event) => setSelectedAreaId(event.target.value)}
            disabled={loading || disableActions || areas.length === 0}
          >
            <option value="">{loading ? 'Loading…' : 'Select a room'}</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        {!loading && areas.length === 0 && (
          <p className="empty-state">No rooms yet. Create your first room.</p>
        )}

        {loading && <p>Loading rooms…</p>}
      </section>
    </div>
  )
}

export default Rooms
