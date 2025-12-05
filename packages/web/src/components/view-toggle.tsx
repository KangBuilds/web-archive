import { Grid2X2, List } from 'lucide-react'
import { useContext } from 'react'
import AppContext from '../store/app'

function ViewToggle() {
  const { view, setView } = useContext(AppContext)

  return (
    <div className="flex items-center bg-secondary/50 rounded-lg p-0.5">
      <button
        className={`flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium transition-all ${
          view === 'card'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        onClick={() => setView('card')}
      >
        <Grid2X2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Grid</span>
      </button>
      <button
        className={`flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium transition-all ${
          view === 'list'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        onClick={() => setView('list')}
      >
        <List className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">List</span>
      </button>
    </div>
  )
}

export default ViewToggle
