import React from 'react'

const Review: React.FC = () => {
  return (
    <div className="view-container">
      <h2>Review & Apply</h2>
      <p>Review all changes before applying them to your Home Assistant instance.</p>

      <div className="placeholder-message">
        <h3>✅ Changeset Review</h3>
        <p>TODO: Implement changeset preview and apply</p>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>Preview all pending changes</li>
          <li>Idempotent changeset application</li>
          <li>Rollback capability</li>
          <li>Version tracking and history</li>
        </ul>
      </div>
    </div>
  )
}

export default Review
