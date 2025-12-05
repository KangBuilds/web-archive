import { Button } from '@web-archive/shared/components/button'
import { Input } from '@web-archive/shared/components/input'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  className?: string
  keyword: string
  setKeyword: (keyword: string) => void
  handleSearch: () => void
}

function SearchBar({ className, keyword, setKeyword, handleSearch }: SearchBarProps) {
  const handleClear = () => {
    setKeyword('')
    handleSearch()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <header className={`${className ?? ''} sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/40`}>
      <div className="flex items-center justify-end h-14 px-4 lg:px-6">
        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              className="w-56 lg:w-72 h-9 pl-9 pr-8 bg-secondary/50 border-transparent hover:border-border focus:border-primary focus:bg-background transition-all text-sm"
              placeholder="Search in current folder"
              value={keyword}
              showRing={false}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {keyword && (
              <button
                onClick={handleClear}
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button
            onClick={handleSearch}
            size="sm"
            className="h-9 px-4 font-medium shadow-none"
          >
            Search
          </Button>
        </div>
      </div>
    </header>
  )
}

export default SearchBar
