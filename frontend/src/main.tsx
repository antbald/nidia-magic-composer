import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const ensureRootElement = () => {
  const existing = document.getElementById('root')
  if (existing) {
    return existing
  }

  const root = document.createElement('div')
  root.id = 'root'

  const body = document.body ?? (() => {
    const createdBody = document.createElement('body')
    document.documentElement.appendChild(createdBody)
    return createdBody
  })()

  body.appendChild(root)
  return root
}

ReactDOM.createRoot(ensureRootElement()).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
