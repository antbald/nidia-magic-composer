import React from 'react'

const Map: React.FC = () => {
  return (
    <div className="view-container">
      <h2>Floor Plan Map</h2>
      <p>Visual layout of your home with room positioning and relationships.</p>

      <div className="placeholder-message">
        <h3>🗺️ Floor Plan Editor</h3>
        <p>TODO: Implement interactive floor plan</p>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>Drag-and-drop room layout</li>
          <li>Visual floor plan builder</li>
          <li>Room connectivity visualization</li>
          <li>Export/import floor plan configurations</li>
        </ul>
      </div>
    </div>
  )
}

export default Map
