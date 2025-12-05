import { useSidebar } from '@web-archive/shared/components/side-bar'
import { Menu } from 'lucide-react'

interface HamburgerProps {
  className?: string
  onClick?: () => void
}

function Hamburger({ className, onClick }: HamburgerProps) {
  const { openMobile, setOpenMobile } = useSidebar()
  return (
    <button
      className={className}
      onClick={() => setOpenMobile(!openMobile)}
      aria-label="Toggle menu"
    >
      <Menu className="h-5 w-5 text-foreground" />
    </button>
  )
}

export default Hamburger
