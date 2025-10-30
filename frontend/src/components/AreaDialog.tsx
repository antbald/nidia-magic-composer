import React, { useState, useEffect } from 'react'
import { IconPicker } from './IconPicker'
import { Area } from '../hooks/useAreas'
import { Floor } from '../hooks/useFloors'

interface AreaDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: AreaFormData) => Promise<void>
  area?: Area | null
  floors: Floor[]
  title?: string
}

export interface AreaFormData {
  name: string
  icon?: string | null
  floor_id?: string | null
  purpose: string
  labels: string[]
  aliases: string[]
}

const AREA_PURPOSES = [
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Bathroom',
  'Office',
  'Hallway',
  'Garage',
  'Storage',
  'Outdoor',
  'Dining Room',
  'Laundry',
  'Basement',
  'Attic',
  'Balcony',
  'Other',
]

export const AreaDialog: React.FC<AreaDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  area,
  floors,
  title,
}) => {
  const [formData, setFormData] = useState<AreaFormData>({
    name: '',
    icon: null,
    floor_id: null,
    purpose: '',
    labels: [],
    aliases: [],
  })
  const [nameError, setNameError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [labelInput, setLabelInput] = useState('')
  const [aliasInput, setAliasInput] = useState('')

  // Initialize form data when area prop changes
  useEffect(() => {
    if (area) {
      setFormData({
        name: area.name,
        icon: area.icon,
        floor_id: area.floor_id,
        purpose: '', // Purpose will come from metadata storage in future
        labels: area.labels || [],
        aliases: area.aliases || [],
      })
      if (area.labels?.length > 0 || area.aliases?.length > 0) {
        setShowAdvanced(true)
      }
    } else {
      setFormData({
        name: '',
        icon: null,
        floor_id: null,
        purpose: '',
        labels: [],
        aliases: [],
      })
      setShowAdvanced(false)
    }
    setNameError('')
  }, [area])

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
      setNameError(error instanceof Error ? error.message : 'Failed to save area')
    } finally {
      setLoading(false)
    }
  }

  const addLabel = () => {
    if (labelInput.trim() && !formData.labels.includes(labelInput.trim())) {
      setFormData({
        ...formData,
        labels: [...formData.labels, labelInput.trim()],
      })
      setLabelInput('')
    }
  }

  const removeLabel = (label: string) => {
    setFormData({
      ...formData,
      labels: formData.labels.filter((l) => l !== label),
    })
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
          <h2>{title || (area ? 'Edit Area' : 'Create Area')}</h2>
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
                placeholder="Enter area name"
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

            {/* Floor Selection */}
            <div className="form-field">
              <label className="form-label">Floor</label>
              <select
                className="form-select"
                value={formData.floor_id || ''}
                onChange={(e) =>
                  setFormData({ ...formData, floor_id: e.target.value || null })
                }
              >
                <option value="">No floor assigned</option>
                {floors.map((floor) => (
                  <option key={floor.floor_id} value={floor.floor_id}>
                    {floor.icon ? `${floor.icon} ` : ''}
                    {floor.name}
                  </option>
                ))}
              </select>
              <span className="form-helper">Assign this area to a floor</span>
            </div>

            {/* Purpose Selection */}
            <div className="form-field">
              <label className="form-label">Purpose</label>
              <select
                className="form-select"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              >
                <option value="">Select purpose (optional)</option>
                {AREA_PURPOSES.map((purpose) => (
                  <option key={purpose} value={purpose}>
                    {purpose}
                  </option>
                ))}
              </select>
              <span className="form-helper">Room type for automation suggestions</span>
            </div>

            {/* Advanced Options Toggle */}
            <div className="form-section-toggle">
              <button
                type="button"
                className="toggle-button"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <span className="toggle-icon">{showAdvanced ? '▼' : '▶'}</span>
                Advanced Options
              </button>
            </div>

            {showAdvanced && (
              <div className="advanced-section">
                {/* Labels */}
                <div className="form-field">
                  <label className="form-label">Labels</label>
                  <div className="chip-input-container">
                    <input
                      type="text"
                      className="chip-input"
                      value={labelInput}
                      onChange={(e) => setLabelInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addLabel()
                        }
                      }}
                      placeholder="Add label..."
                    />
                    <button type="button" className="chip-add-button" onClick={addLabel}>
                      + Add
                    </button>
                  </div>
                  {formData.labels.length > 0 && (
                    <div className="chip-list">
                      {formData.labels.map((label) => (
                        <div key={label} className="chip">
                          <span>{label}</span>
                          <button
                            type="button"
                            className="chip-remove"
                            onClick={() => removeLabel(label)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="form-helper">Organize and filter areas</span>
                </div>

                {/* Aliases */}
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
                    Alternative names for voice assistants
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
              {loading ? 'Saving...' : area ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
