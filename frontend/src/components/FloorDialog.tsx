import React, { useState, useEffect } from 'react'
import { IconPicker } from './IconPicker'
import { Floor } from '../hooks/useFloors'

interface FloorDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: FloorFormData) => Promise<void>
  floor?: Floor | null
  existingFloors: Floor[]
  title?: string
}

export interface FloorFormData {
  name: string
  icon?: string | null
  level?: number | null
  aliases: string[]
}

export const FloorDialog: React.FC<FloorDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  floor,
  existingFloors,
  title,
}) => {
  const [formData, setFormData] = useState<FloorFormData>({
    name: '',
    icon: null,
    level: null,
    aliases: [],
  })
  const [nameError, setNameError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showAliases, setShowAliases] = useState(false)
  const [aliasInput, setAliasInput] = useState('')

  // Initialize form data when floor prop changes
  useEffect(() => {
    if (floor) {
      setFormData({
        name: floor.name,
        icon: floor.icon,
        level: floor.level,
        aliases: floor.aliases || [],
      })
      if (floor.aliases?.length > 0) {
        setShowAliases(true)
      }
    } else {
      // Auto-suggest level based on existing floors
      const maxLevel =
        existingFloors.length > 0
          ? Math.max(...existingFloors.map((f) => f.level || 0))
          : -1
      setFormData({
        name: '',
        icon: 'mdi:floor-plan',
        level: maxLevel + 1,
        aliases: [],
      })
      setShowAliases(false)
    }
    setNameError('')
  }, [floor, existingFloors])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate name
    if (!formData.name.trim()) {
      setNameError('Name is required')
      return
    }

    setNameError('')
    setLoading(true)

    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      setNameError(error instanceof Error ? error.message : 'Failed to save floor')
    } finally {
      setLoading(false)
    }
  }

  const addAlias = () => {
    if (aliasInput.trim() && !formData.aliases.includes(aliasInput.trim())) {
      setFormData({
        ...formData,
        aliases: [...formData.aliases, aliasInput.trim()],
      })
      setAliasInput('')
    }
  }

  const removeAlias = (alias: string) => {
    setFormData({
      ...formData,
      aliases: formData.aliases.filter((a) => a !== alias),
    })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title || (floor ? 'Edit Floor' : 'Create Floor')}</h2>
          <button className="modal-close" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Name Field */}
            <div className="form-field">
              <label className="form-label required">Name</label>
              <input
                type="text"
                className={`form-input ${nameError ? 'error' : ''}`}
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  setNameError('')
                }}
                placeholder="e.g., Ground Floor, First Floor"
                autoFocus
              />
              {nameError && <span className="form-error">{nameError}</span>}
            </div>

            {/* Icon Picker */}
            <IconPicker
              value={formData.icon}
              onChange={(icon) => setFormData({ ...formData, icon })}
              label="Icon"
              placeholder="Select an icon (optional)"
            />

            {/* Level/Order */}
            <div className="form-field">
              <label className="form-label">Level</label>
              <input
                type="number"
                className="form-input"
                value={formData.level ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    level: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="0"
              />
              <span className="form-helper">
                Order number for sorting (e.g., 0 = ground, 1 = first floor)
              </span>
            </div>

            {/* Aliases Toggle */}
            <div className="form-section-toggle">
              <button
                type="button"
                className="toggle-button"
                onClick={() => setShowAliases(!showAliases)}
              >
                <span className="toggle-icon">{showAliases ? '▼' : '▶'}</span>
                Aliases
              </button>
            </div>

            {showAliases && (
              <div className="advanced-section">
                <div className="form-field">
                  <label className="form-label">Aliases</label>
                  <div className="chip-input-container">
                    <input
                      type="text"
                      className="chip-input"
                      value={aliasInput}
                      onChange={(e) => setAliasInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addAlias()
                        }
                      }}
                      placeholder="Add alias..."
                    />
                    <button type="button" className="chip-add-button" onClick={addAlias}>
                      + Add
                    </button>
                  </div>
                  {formData.aliases.length > 0 && (
                    <div className="chip-list">
                      {formData.aliases.map((alias) => (
                        <div key={alias} className="chip">
                          <span>{alias}</span>
                          <button
                            type="button"
                            className="chip-remove"
                            onClick={() => removeAlias(alias)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="form-helper">
                    Alternative names for voice assistants (e.g., "downstairs", "upstairs")
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="button button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={loading || !formData.name.trim()}
            >
              {loading ? 'Saving...' : floor ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
