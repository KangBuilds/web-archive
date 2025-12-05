import React from 'react'
import { Loader2 } from 'lucide-react'

function Loading() {
  return (
    <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center animate-fade-in">
      <div className="relative">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
    </div>
  )
}

function LoadingWrapper({ children, loading }: { children: React.ReactNode, loading: boolean }) {
  return loading ? <Loading /> : children
}

export default LoadingWrapper
