import { useState } from 'react'

export type ViewMode = 'grid' | 'list'

const STORAGE_KEY = 'wa-view-mode'

export function useViewMode() {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as ViewMode) ?? 'grid'
    }
    catch {
      return 'grid'
    }
  })

  const setViewMode = (mode: ViewMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    }
    catch {}
    setViewModeState(mode)
  }

  return { viewMode, setViewMode }
}
