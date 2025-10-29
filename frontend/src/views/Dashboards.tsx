import React from 'react'

const Dashboards: React.FC = () => {
  return (
    <div className="view-container">
      <h2>Dashboard Templates</h2>
      <p>Generate Lovelace dashboards from predefined templates.</p>

      <div className="placeholder-message">
        <h3>📊 Dashboard Builder</h3>
        <p>TODO: Implement dashboard template system</p>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>Select from dashboard templates</li>
          <li>Customize cards and layouts</li>
          <li>Preview dashboard before applying</li>
          <li>Generate YAML configuration</li>
        </ul>
      </div>
    </div>
  )
}

export default Dashboards
