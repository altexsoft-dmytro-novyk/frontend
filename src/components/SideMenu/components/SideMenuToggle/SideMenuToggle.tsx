import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SideMenuToggleProps {
  expanded: boolean
  onToggle: () => void
}

export const SideMenuToggle = ({ expanded, onToggle }: SideMenuToggleProps) => {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex items-center justify-center border-t border-sidebar-border bg-sidebar py-2 text-sidebar-foreground transition-colors',
        'hover:bg-sidebar-accent'
      )}
      aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      data-testid="sidebar-toggle"
    >
      {expanded ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
    </button>
  )
}
