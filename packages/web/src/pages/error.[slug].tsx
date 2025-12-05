import { AlertCircle, Home } from 'lucide-react'
import { Button } from '@web-archive/shared/components/button'
import { Link, useParams } from '~/router'

function ErrorPage() {
  const { slug } = useParams('/error/:slug')

  const getErrorMessage = (code: string) => {
    switch (code) {
      case '404':
        return {
          title: 'Page Not Found',
          description: 'The page you\'re looking for doesn\'t exist or has been moved.',
        }
      case '403':
        return {
          title: 'Access Denied',
          description: 'You don\'t have permission to view this page.',
        }
      case '500':
        return {
          title: 'Server Error',
          description: 'Something went wrong on our end. Please try again later.',
        }
      default:
        return {
          title: `Error ${code}`,
          description: 'An unexpected error occurred.',
        }
    }
  }

  const { title, description } = getErrorMessage(slug ?? '404')

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-md animate-fade-up">
        <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>

        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">{slug}</h1>
        <h2 className="font-serif text-xl font-semibold text-foreground mb-3">{title}</h2>
        <p className="text-muted-foreground mb-8">{description}</p>

        <Button asChild>
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </main>
  )
}

export default ErrorPage
