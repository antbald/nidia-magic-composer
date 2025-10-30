import { useState, useEffect, useCallback } from 'react'
import { useHassConnection } from './useHassConnection'

export interface Floor {
  floor_id: string
  name: string
  icon?: string | null
  level?: number | null
  aliases: string[]
}

interface UseFloorsReturn {
  floors: Floor[]
  loading: boolean
  error: string | null
  createFloor: (data: CreateFloorData) => Promise<Floor>
  updateFloor: (floorId: string, data: UpdateFloorData) => Promise<Floor>
  deleteFloor: (floorId: string) => Promise<void>
  refresh: () => Promise<void>
}

interface CreateFloorData {
  name: string
  icon?: string | null
  level?: number | null
  aliases?: string[]
}

interface UpdateFloorData {
  name?: string
  icon?: string | null
  level?: number | null
  aliases?: string[]
}

export function useFloors(): UseFloorsReturn {
  const connection = useHassConnection()
  const [floors, setFloors] = useState<Floor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFloors = useCallback(async () => {
    if (!connection) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await connection.sendMessagePromise<{ floors: Floor[] }>({
        type: 'nidia_magic_composer/floors/list',
      })

      setFloors(response.floors)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load floors'
      setError(errorMessage)
      console.error('Failed to load floors:', err)
    } finally {
      setLoading(false)
    }
  }, [connection])

  useEffect(() => {
    loadFloors()
  }, [loadFloors])

  const createFloor = useCallback(
    async (data: CreateFloorData): Promise<Floor> => {
      if (!connection) {
        throw new Error('No connection to Home Assistant')
      }

      try {
        const response = await connection.sendMessagePromise<{ floor: Floor }>({
          type: 'nidia_magic_composer/floors/create',
          name: data.name,
          icon: data.icon,
          level: data.level,
          aliases: data.aliases || [],
        })

        // Optimistically update the floors list
        setFloors((prev) => [...prev, response.floor])
        return response.floor
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create floor'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [connection]
  )

  const updateFloor = useCallback(
    async (floorId: string, data: UpdateFloorData): Promise<Floor> => {
      if (!connection) {
        throw new Error('No connection to Home Assistant')
      }

      try {
        const response = await connection.sendMessagePromise<{ floor: Floor }>({
          type: 'nidia_magic_composer/floors/update',
          floor_id: floorId,
          ...data,
        })

        // Optimistically update the floors list
        setFloors((prev) =>
          prev.map((floor) => (floor.floor_id === floorId ? response.floor : floor))
        )
        return response.floor
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update floor'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [connection]
  )

  const deleteFloor = useCallback(
    async (floorId: string): Promise<void> => {
      if (!connection) {
        throw new Error('No connection to Home Assistant')
      }

      try {
        await connection.sendMessagePromise<{ success: boolean; floor_id: string }>({
          type: 'nidia_magic_composer/floors/delete',
          floor_id: floorId,
        })

        // Optimistically update the floors list
        setFloors((prev) => prev.filter((floor) => floor.floor_id !== floorId))
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete floor'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [connection]
  )

  return {
    floors,
    loading,
    error,
    createFloor,
    updateFloor,
    deleteFloor,
    refresh: loadFloors,
  }
}
