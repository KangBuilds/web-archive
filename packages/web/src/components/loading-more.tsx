import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'

const LoadingMore = memo(() => {
  const { t } = useTranslation()
  return (
    <div className="w-full py-8 flex items-center justify-center gap-3">
      <Loader2 className="w-5 h-5 text-primary animate-spin" />
      <span className="text-sm text-muted-foreground">{t('loading-more')}</span>
    </div>
  )
})

export default LoadingMore
