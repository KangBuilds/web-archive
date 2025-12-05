import { Inbox } from 'lucide-react'

function Empty({ className }: { className?: string }) {
  return (
    <div className={`${className ?? ''} flex flex-col items-center justify-center flex-1 py-16`}>
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-serif text-lg font-medium text-foreground mb-1">No data yet</h3>
      <p className="text-sm text-muted-foreground">Items will appear here when available</p>
    </div>
  )
}

export default Empty
