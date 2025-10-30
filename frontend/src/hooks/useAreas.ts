import { useState, useEffect, useCallback } from 'react'
import { useHassConnection } from './useHassConnection'

export interface Area {
  id: string
  name: string
  icon?: string | null
  floor_id?: string | null
  labels: string[]
  aliases: string[]
}

interface UseAreasReturn {
  areas: Area[]
  loading: boolean
  error: string | null
  createArea: (data: CreateAreaData) => Promise<Area>
  updateArea: (areaId: string, data: UpdateAreaData) => Promise<Area>
  deleteArea: (areaId: string) => Promise<void>
  refresh: () => Promise<void>
}

interface CreateAreaData {
  name: string
  icon?: string | null
  floor_id?: string | null
  labels?: string[]
  aliases?: string[]
}

interface UpdateAreaData {
  name?: string
  icon?: string | null
  floor_id?: string | null
  labels?: string[]
  aliases?: string[]
}

export function useAreas(): UseAreasReturn {
  const connection = useHassConnection()
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAreas = useCallback(async () => {
    if (!connection) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await connection.sendMessagePromise<{ areas: Area[] }>({
        type: 'nidia_magic_composer/areas/list',
      })

      setAreas(response.areas)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load areas'
      setError(errorMessage)
      console.error('Failed to load areas:', err)
    } finally {
      setLoading(false)
    }
  }, [connection])

  useEffect(() => {
    loadAreas()
  }, [loadAreas])

  const createArea = useCallback(
    async (data: CreateAreaData): Promise<Area> => {
      if (!connection) {
        throw new Error('No connection to Home Assistant')
      }

      try {
        const response = await connection.sendMessagePromise<{ area: Area }>({
          type: 'nidia_magic_composer/areas/create',
          name: data.name,
          icon: data.icon,
          floor_id: data.floor_id,
          labels: data.labels || [],
          aliases: data.aliases || [],
        })

        // Optimistically update the areas list
        setAreas((prev) => [...prev, response.area])
        return response.area
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create area'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [connection]
  )

  const updateArea = useCallback(
    async (areaId: string, data: UpdateAreaData): Promise<Area> => {
      if (!connection) {
        throw new Error('No connection to Home Assistant')
      }

      try {
        const response = await connection.sendMessagePromise<{ area: Area }>({
          type: 'nidia_magic_composer/areas/update',
          area_id: areaId,
          ...data,
        })

        // Optimistically update the areas list
        setAreas((prev) => prev.map((area) => (area.id === areaId ? response.area : area)))
        return response.area
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update area'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [connection]
  )

  const deleteArea = useCallback(
    async (areaId: string): Promise<void> => {
      if (!connection) {
        throw new Error('No connection to Home Assistant')
      }

      try {
        await connection.sendMessagePromise<{ success: boolean; area_id: string }>({
          type: 'nidia_magic_composer/areas/delete',
          area_id: areaId,
        })

        // Optimistically update the areas list
        setAreas((prev) => prev.filter((area) => area.id !== areaId))
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete area'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [connection]
  )

  return {
    areas,
    loading,
    error,
    createArea,
    updateArea,
    deleteArea,
    refresh: loadAreas,
  }
}
