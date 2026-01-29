import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { StoreProvider } from './stores'
import { ThemeProvider } from './components/ThemeProvider.tsx'
import { Toaster } from '@/components/ui/sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <StoreProvider>
        <Toaster />
        <App />
      </StoreProvider>
    </ThemeProvider>
  </StrictMode>
)
