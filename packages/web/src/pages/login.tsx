import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { CornerDownLeft } from 'lucide-react'
import { Input } from '@web-archive/shared/components/ui/input'
import router from '~/utils/router'

export default function LoginPage() {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)

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
      <form onSubmit={handleLogin} className="w-full max-w-sm">
        <div className="relative">
          <Input
            type="password"
            placeholder="Enter password"
            value={key}
            onChange={e => setKey(e.target.value)}
            className="pr-9"
            autoComplete="current-password"
            autoFocus
            disabled={loading}
          />
          <CornerDownLeft className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </form>
    </div>
  )
}
