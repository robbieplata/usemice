import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { StoreProvider } from './stores'
import { ThemeProvider } from './components/ThemeProvider.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { Toaster } from '@/components/ui/sonner'

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
  </StrictMode>
)
