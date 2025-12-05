import type { FormEvent } from 'react'
import { useState } from 'react'
import { Button } from '@web-archive/shared/components/button'
import { Input } from '@web-archive/shared/components/input'
import toast, { Toaster } from 'react-hot-toast'
import { Archive, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import router from '~/utils/router'

export default function LoginPage() {
  const { t } = useTranslation()
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (key.length < 8) {
      toast.error(t('password-must-be-at-least-8-characters'))
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
          toast.success(t('password-set-success-toast'))
          return
        }
        const json = await res.json()
        toast.error(json.error)
      })
      .catch(() => {
        toast.error(t('something-went-wrong'))
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <div className="min-h-screen flex">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-accent to-secondary/30 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-foreground/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="text-center animate-fade-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-8">
              <Archive className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
              Web Archive
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Your personal library of preserved web pages.
              Capture, organize, and rediscover the web.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="mt-16 grid gap-6 max-w-sm animate-fade-up" style={{ animationDelay: '150ms' }}>
            {[
              'Capture full web pages instantly',
              'Organize with folders and tags',
              'Share your curated collections',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-fade-up">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-4">
              <Archive className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-serif text-2xl font-bold">Web Archive</h1>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-semibold tracking-tight">
                Welcome back
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('please-enter-your-key-to-login')}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="password">
                  Access Key
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('enter-your-password-at-least-8-characters')}
                    value={key}
                    onChange={e => setKey(e.target.value)}
                    className="pr-10 h-11 bg-background border-border/60 focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium transition-all hover:shadow-soft"
                disabled={loading}
              >
                {loading
                  ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('logging-in')}
                    </span>
                    )
                  : (
                      t('login')
                    )}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground pt-4">
              First time? Enter your key to set it as your password.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
