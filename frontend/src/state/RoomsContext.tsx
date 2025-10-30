import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type Room = {
  id: string
  name: string
  floor: string
  purpose: string
  notes: string
  devices: string[]
}

export type CreateRoomPayload = Omit<Room, 'id'>

export type RoomsContextValue = {
  rooms: Room[]
  addRoom: (room: CreateRoomPayload) => void
  updateRoom: (id: string, patch: Partial<CreateRoomPayload>) => void
  removeRoom: (id: string) => void
}

const generateId = () => `room-${Math.random().toString(36).slice(2, 10)}`

const initialRooms: Room[] = []

const RoomsContext = createContext<RoomsContextValue | undefined>(undefined)

export const RoomsProvider = ({ children }: { children: ReactNode }) => {
  const [rooms, setRooms] = useState<Room[]>(initialRooms)

  const addRoom = useCallback((room: CreateRoomPayload) => {
    setRooms((previous) => [...previous, { ...room, id: generateId() }])
  }, [])

  const updateRoom = useCallback((id: string, patch: Partial<CreateRoomPayload>) => {
    setRooms((previous) =>
      previous.map((room) =>
        room.id === id
          ? {
              ...room,
              ...patch,
            }
          : room,
      ),
    )
  }, [])

  const removeRoom = useCallback((id: string) => {
    setRooms((previous) => previous.filter((room) => room.id !== id))
  }, [])

  const value = useMemo(
    () => ({
      rooms,
      addRoom,
      updateRoom,
      removeRoom,
    }),
    [rooms, addRoom, updateRoom, removeRoom],
  )

  return <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>
}

export const useRoomsContext = () => {
  const context = useContext(RoomsContext)
  if (!context) {
    throw new Error('useRoomsContext must be used within a RoomsProvider')
  }
  return context
}
