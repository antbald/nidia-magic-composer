import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Profile from './views/Profile'
import Rooms from './views/Rooms'
import Map from './views/Map'
import Helpers from './views/Helpers'
import Dashboards from './views/Dashboards'
import Review from './views/Review'

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Nidia Magic Composer</h1>
          <p className="subtitle">Automated Home Assistant Setup Wizard</p>
        </header>

        <nav className="app-nav">
          <Link to="/" className="nav-link">Profile</Link>
          <Link to="/rooms" className="nav-link">Rooms</Link>
          <Link to="/map" className="nav-link">Map</Link>
          <Link to="/helpers" className="nav-link">Helpers</Link>
          <Link to="/dashboards" className="nav-link">Dashboards</Link>
          <Link to="/review" className="nav-link">Review</Link>
        </nav>

        <main className="app-content">
          <Routes>
            <Route path="/" element={<Profile />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/map" element={<Map />} />
            <Route path="/helpers" element={<Helpers />} />
            <Route path="/dashboards" element={<Dashboards />} />
            <Route path="/review" element={<Review />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>Version 0.2.0 | Nidia Ecosystem</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
