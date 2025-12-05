import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import '@web-archive/shared/global.css'
import { useLocalStorageState } from 'ahooks'
import { useMemo } from 'react'
import { ThemeProvider } from '@web-archive/shared/components/theme-provider'
import AppContext from './store/app'
import router from './utils/router'

function Routes() {
  const [view, setView] = useLocalStorageState('view', {
    defaultValue: 'card',
  })

  return (
    <AppContext.Provider value={
      useMemo(() => ({
        view: view as 'card' | 'list',
        setView,
      }), [view, setView])
    }
    >
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </AppContext.Provider>
  )
}

createRoot(document.getElementById('root')!).render(<Routes />)
