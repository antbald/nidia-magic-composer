import './App.css'
import Rooms from './views/Rooms'
import { RoomsProvider } from './state/RoomsContext'

function App() {
  return (
    <RoomsProvider>
      <div className="app">
        <header className="app-header">
          <div>
            <p className="eyebrow">Gestione stanze</p>
            <h1>Organizza gli ambienti della tua casa</h1>
            <p className="subtitle">
              Crea, modifica o elimina stanze per avere sempre una panoramica chiara degli spazi e dei
              dispositivi associati.
            </p>
          </div>
        </header>

        <main className="app-content">
          <Rooms />
        </main>
      </div>
    </RoomsProvider>
  )
}

export default App
