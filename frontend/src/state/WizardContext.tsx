import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'

type EnergyMode = 'balanced' | 'eco' | 'comfort'

export type ProfileSettings = {
  name: string
  homeType: string
  floors: number
  timezone: string
  locale: string
  energyMode: EnergyMode
  priorities: string[]
  notes: string
  enableAdvanced: boolean
}

export type RoomDefinition = {
  id: string
  name: string
  floor: string
  purpose: string
  devices: string[]
  coverage: string
}

export type MapState = {
  blueprintReady: boolean
  zonesDefined: boolean
  automationsPreview: boolean
  notes: string
}

export type HelperDefinition = {
  id: string
  name: string
  description: string
  category: string
  enabled: boolean
}

export type DashboardWidget = {
  id: string
  label: string
  description: string
  enabled: boolean
}

export type DashboardState = {
  selectedTemplate: string
  publishTarget: string
  widgets: DashboardWidget[]
}

export type DashboardTemplate = {
  id: string
  name: string
  description: string
  highlights: string[]
}

export type WizardState = {
  profile: ProfileSettings
  rooms: RoomDefinition[]
  map: MapState
  helpers: HelperDefinition[]
  dashboards: DashboardState
}

type WizardContextValue = {
  state: WizardState
  dashboardTemplates: DashboardTemplate[]
  updateProfile: (patch: Partial<ProfileSettings>) => void
  addRoom: (room: Omit<RoomDefinition, 'id'>) => void
  updateRoom: (id: string, patch: Partial<RoomDefinition>) => void
  removeRoom: (id: string) => void
  updateMap: (patch: Partial<MapState>) => void
  toggleHelper: (id: string) => void
  selectDashboardTemplate: (templateId: string) => void
  toggleDashboardWidget: (widgetId: string) => void
  updateDashboardTarget: (target: string) => void
}

const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    id: 'starter',
    name: 'Starter layout',
    description: 'Curated overview of the rooms, energy usage, and quick actions to get you moving fast.',
    highlights: ['Room summary', 'Energy usage', 'Scene shortcuts'],
  },
  {
    id: 'energy-first',
    name: 'Energy insights',
    description: 'Focus on solar production, batteries, and consumption trends with actionable alerts.',
    highlights: ['Solar forecast', 'Battery status', 'Tariff automation'],
  },
  {
    id: 'wellness',
    name: 'Comfort & wellness',
    description: 'Track climate comfort, air quality, and household routines at a glance.',
    highlights: ['Climate comfort', 'Air quality', 'Routine tracker'],
  },
]

const generateId = () => `mc-${Math.random().toString(36).slice(2, 8)}`

const initialState: WizardState = {
  profile: {
    name: 'Casa Principale',
    homeType: 'apartment',
    floors: 1,
    timezone: 'Europe/Rome',
    locale: 'it-IT',
    energyMode: 'balanced',
    priorities: ['Comfort', 'Automation'],
    notes: '',
    enableAdvanced: false,
  },
  rooms: [
    {
      id: generateId(),
      name: 'Living Room',
      floor: 'Ground floor',
      purpose: 'Living',
      devices: ['Lights', 'Media', 'Climate'],
      coverage: 'Main family area',
    },
    {
      id: generateId(),
      name: 'Studio',
      floor: 'First floor',
      purpose: 'Office',
      devices: ['Lighting', 'Sensors'],
      coverage: 'Home office workspace',
    },
  ],
  map: {
    blueprintReady: false,
    zonesDefined: false,
    automationsPreview: false,
    notes: '',
  },
  helpers: [
    {
      id: 'scene_scheduler',
      name: 'Scene scheduler',
      description: 'Preload daily scenes aligned with sunrise, sunset, and occupancy.',
      category: 'Automation',
      enabled: true,
    },
    {
      id: 'energy_guard',
      name: 'Energy guard',
      description: 'Pause heavy loads when energy demand spikes or tariffs change.',
      category: 'Energy',
      enabled: false,
    },
    {
      id: 'presence_orchestrator',
      name: 'Presence orchestrator',
      description: 'Blend sensors and device activity to detect true presence.',
      category: 'Automation',
      enabled: true,
    },
    {
      id: 'air_quality_watch',
      name: 'Air quality watch',
      description: 'Notify when CO₂ or humidity crosses thresholds and suggest actions.',
      category: 'Comfort',
      enabled: false,
    },
    {
      id: 'night_security',
      name: 'Night security routine',
      description: 'Arm selected areas and dim path lights automatically at night.',
      category: 'Security',
      enabled: false,
    },
  ],
  dashboards: {
    selectedTemplate: 'starter',
    publishTarget: 'lovelace_magic_composer',
    widgets: [
      {
        id: 'energy',
        label: 'Energy overview',
        description: 'Live grid, solar, and battery balance with trends.',
        enabled: true,
      },
      {
        id: 'comfort',
        label: 'Climate comfort',
        description: 'Temperature and humidity insights with quick adjustments.',
        enabled: true,
      },
      {
        id: 'automation',
        label: 'Automation status',
        description: 'Monitor currently running automations and queued jobs.',
        enabled: false,
      },
      {
        id: 'rooms',
        label: 'Room quick actions',
        description: 'Favourite rooms with lighting, blinds, and media controls.',
        enabled: true,
      },
    ],
  },
}

export const WizardContext = createContext<WizardContextValue | undefined>(undefined)

type WizardProviderProps = {
  children: ReactNode
}

export const WizardProvider = ({ children }: WizardProviderProps) => {
  const [state, setState] = useState<WizardState>(initialState)

  const updateProfile = useCallback((patch: Partial<ProfileSettings>) => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...patch,
      },
    }))
  }, [])

  const addRoom = useCallback((room: Omit<RoomDefinition, 'id'>) => {
    setState((prev) => ({
      ...prev,
      rooms: [...prev.rooms, { ...room, id: generateId() }],
    }))
  }, [])

  const updateRoom = useCallback((id: string, patch: Partial<RoomDefinition>) => {
    setState((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) =>
        room.id === id
          ? {
              ...room,
              ...patch,
            }
          : room,
      ),
    }))
  }, [])

  const removeRoom = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((room) => room.id !== id),
    }))
  }, [])

  const updateMap = useCallback((patch: Partial<MapState>) => {
    setState((prev) => ({
      ...prev,
      map: {
        ...prev.map,
        ...patch,
      },
    }))
  }, [])

  const toggleHelper = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      helpers: prev.helpers.map((helper) =>
        helper.id === id
          ? {
              ...helper,
              enabled: !helper.enabled,
            }
          : helper,
      ),
    }))
  }, [])

  const selectDashboardTemplate = useCallback((templateId: string) => {
    setState((prev) => ({
      ...prev,
      dashboards: {
        ...prev.dashboards,
        selectedTemplate: templateId,
      },
    }))
  }, [])

  const toggleDashboardWidget = useCallback((widgetId: string) => {
    setState((prev) => ({
      ...prev,
      dashboards: {
        ...prev.dashboards,
        widgets: prev.dashboards.widgets.map((widget) =>
          widget.id === widgetId
            ? {
                ...widget,
                enabled: !widget.enabled,
              }
            : widget,
        ),
      },
    }))
  }, [])

  const updateDashboardTarget = useCallback((target: string) => {
    setState((prev) => ({
      ...prev,
      dashboards: {
        ...prev.dashboards,
        publishTarget: target,
      },
    }))
  }, [])

  const value = useMemo(
    () => ({
      state,
      dashboardTemplates: DASHBOARD_TEMPLATES,
      updateProfile,
      addRoom,
      updateRoom,
      removeRoom,
      updateMap,
      toggleHelper,
      selectDashboardTemplate,
      toggleDashboardWidget,
      updateDashboardTarget,
    }),
    [
      state,
      updateProfile,
      addRoom,
      updateRoom,
      removeRoom,
      updateMap,
      toggleHelper,
      selectDashboardTemplate,
      toggleDashboardWidget,
      updateDashboardTarget,
    ],
  )

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
}
