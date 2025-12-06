import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import '@web-archive/shared/global.css'
import { Toaster } from 'sonner'
import router from './utils/router'
import { ThemeProvider } from '~/components/theme-provider'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="web-archive-theme">
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors closeButton />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
