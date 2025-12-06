import { useCallback, useEffect, useState } from 'react'

export function useObjectURL(initialObject: Blob | string | null) {
  const [objectURL, setObjectURL] = useState<string | null>(null)
  const [object, setObject] = useState<Blob | string | null>(initialObject)

  useEffect(() => {
    if (!object) {
      setObjectURL(null)
      return
    }

    let url: string
    if (typeof object === 'string') {
      const blob = new Blob([object], { type: 'text/html' })
      url = URL.createObjectURL(blob)
    }
    else {
      url = URL.createObjectURL(object)
    }

    setObjectURL(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [object])

  const updateObject = useCallback((newObject: Blob | string | null) => {
    setObject(newObject)
  }, [])

  return { objectURL, setObject: updateObject }
}
