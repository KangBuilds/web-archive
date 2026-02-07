import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@web-archive/shared/components/ui/button'
import { Input } from '@web-archive/shared/components/ui/input'
import router from '~/utils/router'

export default function LoginPage() {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (key.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    fetch('api/auth', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
      },
    })
      .then(async (res) => {
        if (res.status === 200) {
          localStorage.setItem('token', key)
          router.navigate('/')
          return
        }
        if (res.status === 201) {
          toast.success('Admin password set, please use it to login again')
          return
        }
        const json = await res.json()
        toast.error(json.error)
      })
      .catch(() => {
        toast.error('Something went wrong')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="flex w-full max-w-sm gap-2">
        <div className="relative flex-1">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            value={key}
            onChange={e => setKey(e.target.value)}
            className="pr-9"
            autoComplete="current-password"
            autoFocus
            disabled={loading}
          />
          <button
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Go'}
        </Button>
      </form>
    </div>
  )
}
