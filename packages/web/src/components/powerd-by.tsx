import { memo } from 'react'
import { Archive } from 'lucide-react'
import { GithubIcon } from './github'

function Comp() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/40">
      <div className="flex items-center justify-between h-14 px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
            <Archive className="w-4 h-4 text-primary" />
          </div>
          <span className="font-serif text-lg font-semibold text-foreground">Web Archive</span>
        </div>

        <a
          href="https://github.com/ray-d-song/web-archive"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <GithubIcon className="w-4 h-4" />
          <span>GitHub</span>
        </a>
      </div>
    </header>
  )
}

const PoweredBy = memo(Comp)

export default PoweredBy
