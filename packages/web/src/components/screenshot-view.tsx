import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { Skeleton } from '@web-archive/shared/components/ui/skeleton'
import { cn } from '@web-archive/shared/utils'

interface ScreenshotViewProps {
  screenshotId: string | null
  className?: string
  loadingClassName?: string
}

export default function ScreenshotView({
  screenshotId,
  className,
  loadingClassName,
}: ScreenshotViewProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  if (!screenshotId) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted',
          loadingClassName,
        )}
      >
        <ImageOff className="h-8 w-8 text-muted-foreground/50" />
      </div>
    )
  }

  return (
    <>
      {status === 'loading' && <Skeleton className={cn(loadingClassName)} />}
      {status === 'error' && (
        <div
          className={cn(
            'flex items-center justify-center bg-muted',
            loadingClassName,
          )}
        >
          <ImageOff className="h-8 w-8 text-muted-foreground/50" />
        </div>
      )}
      <img
        src={`/api/pages/screenshot?id=${screenshotId}`}
        alt="Page screenshot"
        className={cn(className, status !== 'loaded' && 'hidden')}
        loading="lazy"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </>
  )
}
