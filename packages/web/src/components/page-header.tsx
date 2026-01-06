import { Moon, Search, Sun, X } from 'lucide-react'
import { Button } from '@web-archive/shared/components/ui/button'
import { Input } from '@web-archive/shared/components/ui/input'
import { useTheme } from '~/components/theme-provider'

interface PageHeaderProps {
  keyword: string
  setKeyword: (keyword: string) => void
  handleSearch: () => void
  searchPlaceholder?: string
}

export default function PageHeader({
  keyword,
  setKeyword,
  handleSearch,
  searchPlaceholder = 'Search pages...',
}: PageHeaderProps) {
  const { theme, setTheme } = useTheme()

  const handleClear = () => {
    setKeyword('')
    handleSearch()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9 pr-9"
            placeholder={searchPlaceholder}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {keyword && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button onClick={handleSearch} size="sm">
          Search
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="ml-auto"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </header>
  )
}
