import { useState } from 'react'
import { useFloors } from '../hooks/useFloors'
import { useAreas } from '../hooks/useAreas'
import { AreaDialog, AreaFormData } from '../components/AreaDialog'
import { FloorDialog, FloorFormData } from '../components/FloorDialog'

const Rooms = () => {
  const { floors, loading: floorsLoading, createFloor, updateFloor, deleteFloor } = useFloors()
  const { areas, loading: areasLoading, createArea, updateArea, deleteArea } = useAreas()

  // Dialog states
  const [isAreaDialogOpen, setIsAreaDialogOpen] = useState(false)
  const [isFloorDialogOpen, setIsFloorDialogOpen] = useState(false)
  const [editingArea, setEditingArea] = useState<any>(null)
  const [editingFloor, setEditingFloor] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'area' | 'floor'
    id: string
    name: string
  } | null>(null)

  // Floor management handlers
  const handleCreateFloor = () => {
    setEditingFloor(null)
    setIsFloorDialogOpen(true)
  }

  const handleEditFloor = (floor: any) => {
    setEditingFloor(floor)
    setIsFloorDialogOpen(true)
  }

  const handleSaveFloor = async (data: FloorFormData) => {
    if (editingFloor) {
      await updateFloor(editingFloor.floor_id, data)
    } else {
      await createFloor(data)
    }
  }

  const handleDeleteFloor = async (floorId: string) => {
    try {
      await deleteFloor(floorId)
      setDeleteConfirm(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete floor')
    }
  }

  // Area management handlers
  const handleCreateArea = () => {
    setEditingArea(null)
    setIsAreaDialogOpen(true)
  }

  const handleEditArea = (area: any) => {
    setEditingArea(area)
    setIsAreaDialogOpen(true)
  }

  const handleSaveArea = async (data: AreaFormData) => {
    if (editingArea) {
      await updateArea(editingArea.id, data)
    } else {
      await createArea(data)
    }
  }

  const handleDeleteArea = async (areaId: string) => {
    try {
      await deleteArea(areaId)
      setDeleteConfirm(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete area')
    }
  }

  // Group areas by floor
  const areasByFloor = areas.reduce((acc, area) => {
    const floorId = area.floor_id || 'unassigned'
    if (!acc[floorId]) {
      acc[floorId] = []
    }
    acc[floorId].push(area)
    return acc
  }, {} as Record<string, typeof areas>)

  // Sort floors by level
  const sortedFloors = [...floors].sort((a, b) => {
    const levelA = a.level ?? 999
    const levelB = b.level ?? 999
    return levelA - levelB
  })

  const loading = floorsLoading || areasLoading

  return (
    <div className="view-stack">
      {/* Header Section */}
      <section className="card">
        <header className="card-header">
          <h3>Areas & Floors</h3>
          <p>
            Define the structure of your home by creating floors and areas. Areas can be assigned
            to floors and will be used throughout Home Assistant for organization and automation.
          </p>
        </header>
      </section>

      {/* Floors Management Section */}
      <section className="card">
        <header className="card-header">
          <div className="header-with-action">
            <div>
              <h3>Floors</h3>
              <p>Organize your home by floors (e.g., Ground Floor, First Floor, Basement)</p>
            </div>
            <button className="button button-primary" onClick={handleCreateFloor}>
              + Create Floor
            </button>
          </div>
        </header>

        <div className="card-body">
          {loading && floors.length === 0 ? (
            <div className="loading-state">Loading floors...</div>
          ) : floors.length === 0 ? (
            <div className="empty-state">
              <p>No floors created yet. Create your first floor to organize areas by levels.</p>
            </div>
          ) : (
            <div className="floors-list">
              {sortedFloors.map((floor) => (
                <div key={floor.floor_id} className="floor-item">
                  <div className="floor-info">
                    {floor.icon && <span className="floor-icon">{floor.icon}</span>}
                    <span className="floor-name">{floor.name}</span>
                    {floor.level !== null && floor.level !== undefined && (
                      <span className="floor-level">Level {floor.level}</span>
                    )}
                    {areasByFloor[floor.floor_id] && (
                      <span className="floor-count">
                        {areasByFloor[floor.floor_id].length} area(s)
                      </span>
                    )}
                  </div>
                  <div className="floor-actions">
                    <button
                      className="button button-small button-secondary"
                      onClick={() => handleEditFloor(floor)}
                    >
                      Edit
                    </button>
                    <button
                      className="button button-small button-danger"
                      onClick={() =>
                        setDeleteConfirm({
                          type: 'floor',
                          id: floor.floor_id,
                          name: floor.name,
                        })
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Areas Management Section */}
      <section className="card">
        <header className="card-header">
          <div className="header-with-action">
            <div>
              <h3>Areas</h3>
              <p>
                Create areas (rooms) for your home. Each area can have an icon, be assigned to a
                floor, and have a purpose for automation suggestions.
              </p>
            </div>
            <button className="button button-primary" onClick={handleCreateArea}>
              + Create Area
            </button>
          </div>
        </header>

        <div className="card-body">
          {loading && areas.length === 0 ? (
            <div className="loading-state">Loading areas...</div>
          ) : areas.length === 0 ? (
            <div className="empty-state">
              <p>
                No areas created yet. Create your first area to start organizing your smart home.
              </p>
            </div>
          ) : (
            <>
              {/* Areas by Floor */}
              {sortedFloors.length > 0 ? (
                sortedFloors.map((floor) => {
                  const floorAreas = areasByFloor[floor.floor_id] || []
                  if (floorAreas.length === 0) return null

                  return (
                    <div key={floor.floor_id} className="floor-section">
                      <h4 className="floor-section-title">
                        {floor.icon && <span>{floor.icon}</span>}
                        {floor.name}
                      </h4>
                      <div className="area-grid">
                        {floorAreas.map((area) => (
                          <div key={area.id} className="area-card">
                            <div className="area-card-header">
                              {area.icon && <span className="area-icon">{area.icon}</span>}
                              <h5 className="area-name">{area.name}</h5>
                            </div>
                            <div className="area-meta">
                              {area.labels && area.labels.length > 0 && (
                                <div className="area-labels">
                                  {area.labels.slice(0, 3).map((label) => (
                                    <span key={label} className="label-badge">
                                      {label}
                                    </span>
                                  ))}
                                  {area.labels.length > 3 && (
                                    <span className="label-badge">
                                      +{area.labels.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="area-card-actions">
                              <button
                                className="button button-small button-secondary"
                                onClick={() => handleEditArea(area)}
                              >
                                Edit
                              </button>
                              <button
                                className="button button-small button-danger"
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: 'area',
                                    id: area.id,
                                    name: area.name,
                                  })
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              ) : null}

              {/* Unassigned Areas */}
              {areasByFloor['unassigned'] && areasByFloor['unassigned'].length > 0 && (
                <div className="floor-section">
                  <h4 className="floor-section-title">Unassigned Areas</h4>
                  <div className="area-grid">
                    {areasByFloor['unassigned'].map((area) => (
                      <div key={area.id} className="area-card">
                        <div className="area-card-header">
                          {area.icon && <span className="area-icon">{area.icon}</span>}
                          <h5 className="area-name">{area.name}</h5>
                        </div>
                        <div className="area-meta">
                          {area.labels && area.labels.length > 0 && (
                            <div className="area-labels">
                              {area.labels.slice(0, 3).map((label) => (
                                <span key={label} className="label-badge">
                                  {label}
                                </span>
                              ))}
                              {area.labels.length > 3 && (
                                <span className="label-badge">+{area.labels.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="area-card-actions">
                          <button
                            className="button button-small button-secondary"
                            onClick={() => handleEditArea(area)}
                          >
                            Edit
                          </button>
                          <button
                            className="button button-small button-danger"
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'area',
                                id: area.id,
                                name: area.name,
                              })
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Dialogs */}
      <FloorDialog
        isOpen={isFloorDialogOpen}
        onClose={() => {
          setIsFloorDialogOpen(false)
          setEditingFloor(null)
        }}
        onSave={handleSaveFloor}
        floor={editingFloor}
        existingFloors={floors}
      />

      <AreaDialog
        isOpen={isAreaDialogOpen}
        onClose={() => {
          setIsAreaDialogOpen(false)
          setEditingArea(null)
        }}
        onSave={handleSaveArea}
        area={editingArea}
        floors={floors}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-dialog modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)} type="button">
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete the {deleteConfirm.type} "
                <strong>{deleteConfirm.name}</strong>"?
              </p>
              {deleteConfirm.type === 'floor' && areasByFloor[deleteConfirm.id]?.length > 0 && (
                <p className="warning-text">
                  This floor has {areasByFloor[deleteConfirm.id].length} area(s) assigned. Please
                  reassign or delete them first.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="button button-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="button button-danger"
                onClick={() => {
                  if (deleteConfirm.type === 'area') {
                    handleDeleteArea(deleteConfirm.id)
                  } else {
                    handleDeleteFloor(deleteConfirm.id)
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Rooms
