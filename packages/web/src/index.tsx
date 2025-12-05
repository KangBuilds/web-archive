import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import '@web-archive/shared/global.css'
import { ThemeProvider } from '@web-archive/shared/components/theme-provider'
import router from './utils/router'

function Routes() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(<Routes />)
