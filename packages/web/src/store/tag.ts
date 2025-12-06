import { createContext } from 'react'
import type { Tag } from '@web-archive/shared/types'

interface TagContextType {
  tagCache: Tag[]
  refreshTagCache: () => void
}

const TagContext = createContext<TagContextType>({
  tagCache: [],
  refreshTagCache: () => {},
})

export default TagContext
