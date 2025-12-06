import { useQuery } from '@tanstack/react-query'
import { ImageOff } from 'lucide-react'
import { Skeleton } from '@web-archive/shared/components/ui/skeleton'
import { cn } from '@web-archive/shared/utils'
import { getPageScreenshot } from '~/data/page'
import { useObjectURL } from '~/hooks/useObjectUrl'

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
  const { objectURL, setObject } = useObjectURL(null)

  const { isLoading, isError } = useQuery({
    queryKey: ['screenshot', screenshotId],
    queryFn: async () => {
      const blob = await getPageScreenshot(screenshotId)()
      if (blob) {
        setObject(blob)
      }
      return blob
    },
    enabled: !!screenshotId,
  })

  if (!screenshotId || isError) {
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

  if (isLoading || !objectURL) {
    return <Skeleton className={cn(loadingClassName)} />
  }

  return (
    <img
      src={objectURL}
      alt="Page screenshot"
      className={cn(className)}
      loading="lazy"
    />
  )
}
