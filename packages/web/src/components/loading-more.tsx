import { memo } from 'react'
import { Loader2 } from 'lucide-react'

const LoadingMore = memo(() => {
  return (
    <div className="w-full py-8 flex items-center justify-center gap-3">
      <Loader2 className="w-5 h-5 text-primary animate-spin" />
      <span className="text-sm text-muted-foreground">Loading more...</span>
    </div>
  )
})

export default LoadingMore
