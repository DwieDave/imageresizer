import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { RegistryContext } from '@effect-rx/rx-react'
import { stateRegistry } from './state.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RegistryContext.Provider value={stateRegistry}>
      <App />
    </RegistryContext.Provider>
  </StrictMode>,
)
