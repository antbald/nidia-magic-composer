import { useEffect, useState } from 'react'

export interface HassConnection {
  sendMessagePromise<T>(message: Record<string, unknown>): Promise<T>
}

declare global {
  interface Window {
    hassConnection?: Promise<{ connection: HassConnection }>
  }
}

export function useHassConnection(): HassConnection | null {
  const [connection, setConnection] = useState<HassConnection | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadConnection() {
      if (!window.hassConnection) {
        return
      }

      try {
        const { connection: haConnection } = await window.hassConnection
        if (isActive) {
          setConnection(haConnection)
        }
      } catch (error) {
        // Swallow errors for now; the UI will remain in a disabled state.
        console.error('Failed to acquire Home Assistant connection', error)
      }
    }

    loadConnection()

    return () => {
      isActive = false
    }
  }, [])

  return connection
}

