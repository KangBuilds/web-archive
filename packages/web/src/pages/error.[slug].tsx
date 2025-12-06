import { AlertTriangle } from 'lucide-react'
import { Button } from '@web-archive/shared/components/ui/button'
import { Link, useParams } from '~/router'

export default function ErrorPage() {
  const { slug } = useParams('/error/:slug')

  const errorMessages: Record<string, { title: string, description: string }> = {
    404: {
      title: 'Page not found',
      description: 'The page you\'re looking for doesn\'t exist or has been moved.',
    },
    500: {
      title: 'Server error',
      description: 'Something went wrong on our end. Please try again later.',
    },
    401: {
      title: 'Unauthorized',
      description: 'You need to be logged in to view this page.',
    },
  }

  const error = errorMessages[slug ?? '404'] ?? errorMessages['404']

  return (
    <div className="flex h-svh flex-col items-center justify-center gap-4 p-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{error.title}</h1>
        <p className="mt-1 max-w-md text-muted-foreground">{error.description}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => window.history.back()}>
          Go back
        </Button>
        <Button asChild>
          <Link to="/">Go home</Link>
        </Button>
      </div>
    </div>
  )
}
