import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ParkingSystemPro } from './parking-system-pro'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ParkingSystemPro/>
  </React.StrictMode>
)
