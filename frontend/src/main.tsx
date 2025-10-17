import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ParkingSystemPro from './parking-system-pro'

const rootEl = document.getElementById('root') as HTMLElement | null
if (!rootEl) {
  throw new Error('Root element with id="root" not found')
}

createRoot(rootEl).render(
  <React.StrictMode>
    <ParkingSystemPro />
  </React.StrictMode>
)
