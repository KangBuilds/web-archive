import { FileQuestion } from 'lucide-react'
import { Button } from '@web-archive/shared/components/button'
import { Link } from '~/router'

function NotFound({ className }: { className?: string }) {
  return (
    <div className={`${className ?? ''} flex flex-col items-center justify-center flex-1 py-20 animate-fade-up`}>
      <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <FileQuestion className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Page Not Found</h2>
      <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Button asChild variant="outline">
        <Link to="/">Go to Home</Link>
      </Button>
    </div>
  )
}

export default NotFound
