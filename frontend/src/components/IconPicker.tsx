import React, { useState, useMemo } from 'react'

interface IconPickerProps {
  value: string | null | undefined
  onChange: (icon: string | null) => void
  label?: string
  placeholder?: string
}

// Common Home Assistant / Material Design Icons for areas and floors
const COMMON_ICONS = [
  { value: null, label: 'No icon', icon: '○' },
  { value: 'mdi:home', label: 'Home', icon: '🏠' },
  { value: 'mdi:sofa', label: 'Living Room', icon: '🛋️' },
  { value: 'mdi:bed', label: 'Bedroom', icon: '🛏️' },
  { value: 'mdi:silverware-fork-knife', label: 'Kitchen', icon: '🍴' },
  { value: 'mdi:shower', label: 'Bathroom', icon: '🚿' },
  { value: 'mdi:desk', label: 'Office', icon: '🖥️' },
  { value: 'mdi:dumbbell', label: 'Gym', icon: '🏋️' },
  { value: 'mdi:tools', label: 'Garage/Workshop', icon: '🔧' },
  { value: 'mdi:warehouse', label: 'Storage', icon: '📦' },
  { value: 'mdi:hanger', label: 'Closet', icon: '👔' },
  { value: 'mdi:floor-plan', label: 'Floor', icon: '🗂️' },
  { value: 'mdi:stairs', label: 'Stairs', icon: '🪜' },
  { value: 'mdi:walk', label: 'Hallway', icon: '🚶' },
  { value: 'mdi:pine-tree', label: 'Outdoor', icon: '🌲' },
  { value: 'mdi:flower', label: 'Garden', icon: '🌸' },
  { value: 'mdi:washing-machine', label: 'Laundry', icon: '🧺' },
  { value: 'mdi:bookshelf', label: 'Library', icon: '📚' },
  { value: 'mdi:baby-carriage', label: 'Nursery', icon: '👶' },
  { value: 'mdi:gamepad-variant', label: 'Game Room', icon: '🎮' },
]

export const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onChange,
  label = 'Icon',
  placeholder = 'Select an icon',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredIcons = useMemo(() => {
    if (!search) return COMMON_ICONS
    const searchLower = search.toLowerCase()
    return COMMON_ICONS.filter(
      (icon) =>
        icon.label.toLowerCase().includes(searchLower) ||
        (icon.value && icon.value.toLowerCase().includes(searchLower))
    )
  }, [search])

  const selectedIcon = COMMON_ICONS.find((icon) => icon.value === value)

  return (
    <div className="icon-picker">
      <label className="form-label">{label}</label>
      <div className="icon-picker-control">
        <button
          type="button"
          className="icon-picker-button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="icon-picker-preview">
            {selectedIcon ? (
              <>
                <span className="icon-emoji">{selectedIcon.icon}</span>
                <span className="icon-label">{selectedIcon.label}</span>
              </>
            ) : (
              <span className="icon-placeholder">{placeholder}</span>
            )}
          </span>
          <span className="icon-picker-arrow">{isOpen ? '▲' : '▼'}</span>
        </button>

        {isOpen && (
          <div className="icon-picker-dropdown">
            <div className="icon-picker-search">
              <input
                type="text"
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="icon-search-input"
                autoFocus
              />
            </div>
            <div className="icon-picker-grid">
              {filteredIcons.map((icon) => (
                <button
                  key={icon.value || 'none'}
                  type="button"
                  className={`icon-option ${icon.value === value ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(icon.value)
                    setIsOpen(false)
                    setSearch('')
                  }}
                  title={icon.label}
                >
                  <span className="icon-emoji">{icon.icon}</span>
                  <span className="icon-name">{icon.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
