import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { OrganizationProvider } from './contexts/OrganizationContext'
import './styles/index.css'

// SECURITY: Auth and admin functions are no longer exposed to window
// Use the authenticated admin UI for admin operations

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <OrganizationProvider>
          <App />
        </OrganizationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
