import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/components/App.tsx'
import { RegistryContext } from '@effect-rx/rx-react'
import { stateRegistry } from '@/lib/state.ts'
import { ThemeProvider } from '@/components/ThemeProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <RegistryContext.Provider value={stateRegistry}>
        <App />
      </RegistryContext.Provider>
    </ThemeProvider>
  </StrictMode>,
)
