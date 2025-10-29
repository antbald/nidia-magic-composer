import React from 'react'

const Profile: React.FC = () => {
  return (
    <div className="view-container">
      <h2>Profile Setup</h2>
      <p>Configure your home profile with basic information and preferences.</p>

      <div className="placeholder-message">
        <h3>🏠 Profile Configuration</h3>
        <p>TODO: Implement profile configuration form</p>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>Profile name selection</li>
          <li>Home type (apartment, house, etc.)</li>
          <li>Number of floors</li>
          <li>Timezone and locale settings</li>
        </ul>
      </div>
    </div>
  )
}

export default Profile
