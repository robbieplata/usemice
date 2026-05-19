import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { StoreProvider } from './stores/index.tsx'
import { ThemeProvider } from './components/ThemeProvider.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { Toaster } from './components/ui/sonner.tsx'

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
      <ErrorBoundary>
        <StoreProvider>
          <Toaster />
          <App />
        </StoreProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </StrictMode>,
)
