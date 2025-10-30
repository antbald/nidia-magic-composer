import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
  matchPath,
} from 'react-router-dom'
import './App.css'
import Profile from './views/Profile'
import Rooms from './views/Rooms'
import Map from './views/Map'
import Helpers from './views/Helpers'
import Dashboards from './views/Dashboards'
import Review from './views/Review'
import { WizardProvider, type WizardState } from './state/WizardContext'
import { useWizard } from './hooks/useWizard'

const CURRENT_VERSION = '0.3.1'

type StepStatus = 'done' | 'active' | 'todo'

const steps = [
  {
    path: '/',
    label: 'Profile',
    description: 'Describe the home profile, time zone, and automation goals.',
  },
  {
    path: '/rooms',
    label: 'Rooms',
    description: 'Model rooms, floors, and the devices that live in each area.',
  },
  {
    path: '/map',
    label: 'Spatial map',
    description: 'Upload floor plans and map rooms to Home Assistant areas.',
  },
  {
    path: '/helpers',
    label: 'Helpers',
    description: 'Pick the orchestrations and routines to automate daily life.',
  },
  {
    path: '/dashboards',
    label: 'Dashboards',
    description: 'Curate Lovelace dashboards and quick actions for the household.',
  },
  {
    path: '/review',
    label: 'Review & publish',
    description: 'Validate the blueprint, preview changes, and publish to Home Assistant.',
  },
]

const classNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

const computeStepStatuses = (state: WizardState): StepStatus[] => {
  const completionFlags = [
    Boolean(state.profile.name && state.profile.homeType && state.profile.timezone),
    state.rooms.length > 0,
    state.map.automationsPreview,
    state.helpers.some((helper) => helper.enabled),
    Boolean(state.dashboards.selectedTemplate),
    Boolean(
      state.profile.name &&
        state.rooms.length > 0 &&
        state.map.zonesDefined &&
        state.helpers.some((helper) => helper.enabled),
    ),
  ]

  let activeAssigned = false

  return completionFlags.map((flag) => {
    if (flag) {
      return 'done'
    }
    if (!activeAssigned) {
      activeAssigned = true
      return 'active'
    }
    return 'todo'
  })
}

const Sidebar = () => {
  const { state } = useWizard()
  const stepStatuses = computeStepStatuses(state)
  const completedSteps = stepStatuses.filter((status) => status === 'done').length
  const progressPercent = Math.round((completedSteps / steps.length) * 100)

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-badge">Magic Composer</div>
        <h1>Nidia Automation Suite</h1>
        <p>Bring your Home Assistant deployment to life with guided orchestration.</p>

        <div className="progress">
          <div className="progress-meta">
            <span>Blueprint readiness</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="progress-bar">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="progress-helper">
            {completedSteps} of {steps.length} stages completed
          </p>
        </div>
      </div>

      <nav className="wizard-nav">
        {steps.map((step, index) => (
          <NavLink
            key={step.path}
            to={step.path}
            end={step.path === '/'}
            className={({ isActive }) =>
              classNames(
                'nav-link',
                `status-${stepStatuses[index]}`,
                isActive && 'active',
              )
            }
          >
            <div className="step-index">{index + 1}</div>
            <div className="step-info">
              <span className="step-label">{step.label}</span>
              <span className="step-description">{step.description}</span>
            </div>
            <div className="step-state" aria-hidden>
              {stepStatuses[index] === 'done' ? '✓' : stepStatuses[index] === 'active' ? '›' : ''}
            </div>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div>
          <span className="sidebar-eyebrow">Current version</span>
          <span className="sidebar-value">{CURRENT_VERSION}</span>
        </div>
        <div>
          <span className="sidebar-eyebrow">Support</span>
          <a
            className="sidebar-link"
            href="https://github.com/antbald/nidia-magic-composer/issues"
            target="_blank"
            rel="noreferrer"
          >
            Report feedback ↗
          </a>
        </div>
      </div>
    </aside>
  )
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Profile />} />
    <Route path="/rooms" element={<Rooms />} />
    <Route path="/map" element={<Map />} />
    <Route path="/helpers" element={<Helpers />} />
    <Route path="/dashboards" element={<Dashboards />} />
    <Route path="/review" element={<Review />} />
  </Routes>
)

const MainArea = () => {
  const location = useLocation()
  const { state } = useWizard()
  const stepStatuses = computeStepStatuses(state)

  const activeIndexMatch = steps.findIndex((step) =>
    matchPath(
      { path: step.path, end: step.path === '/' },
      location.pathname,
    ),
  )

  const activeIndex = activeIndexMatch >= 0 ? activeIndexMatch : 0

  const currentStep = steps[activeIndex] ?? steps[0]

  const roomsCount = state.rooms.length
  const helpersEnabled = state.helpers.filter((helper) => helper.enabled).length
  const widgetsEnabled = state.dashboards.widgets.filter((widget) => widget.enabled).length

  return (
    <div className="main-area">
      <header className="main-header">
        <div className="main-header-copy">
          <span className="eyebrow">
            Step {activeIndex + 1} of {steps.length}{' '}
            <span className={classNames('pill', `pill-${stepStatuses[activeIndex]}`)}>
              {stepStatuses[activeIndex] === 'done'
                ? 'Completed'
                : stepStatuses[activeIndex] === 'active'
                  ? 'In progress'
                  : 'Planned'}
            </span>
          </span>
          <h2>{currentStep.label}</h2>
          <p>{currentStep.description}</p>
        </div>

        <div className="header-actions">
          <span className="badge badge-neutral">Preview build</span>
          <span className="badge badge-accent">Beta experience</span>
        </div>
      </header>

      <div className="status-grid">
        <div className="status-card">
          <span className="status-icon" aria-hidden>🏠</span>
          <div>
            <p className="status-label">Rooms planned</p>
            <p className="status-value">{roomsCount}</p>
          </div>
          <span className="status-sub">Capture every floor and shared area.</span>
        </div>
        <div className="status-card">
          <span className="status-icon" aria-hidden>⚙️</span>
          <div>
            <p className="status-label">Automations enabled</p>
            <p className="status-value">{helpersEnabled}</p>
          </div>
          <span className="status-sub">Blend recommended helpers with your routines.</span>
        </div>
        <div className="status-card">
          <span className="status-icon" aria-hidden>📊</span>
          <div>
            <p className="status-label">Dashboard widgets</p>
            <p className="status-value">{widgetsEnabled}</p>
          </div>
          <span className="status-sub">Curate cards for the new household dashboard.</span>
        </div>
      </div>

      <div className="main-content">
        <AppRoutes />
      </div>
    </div>
  )
}

function App() {
  return (
    <WizardProvider>
      <Router>
        <div className="app-shell">
          <Sidebar />
          <MainArea />
        </div>
      </Router>
    </WizardProvider>
  )
}

export default App
