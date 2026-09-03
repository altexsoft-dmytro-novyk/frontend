import { NavLink } from 'react-router-dom'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SideMenuItemProps {
  icon: LucideIcon
  label: string
  path: string
  hint?: string
  counter?: number
  expanded: boolean
  /** Exact-match active state (default: NavLink's prefix match). */
  end?: boolean
  onNavigate?: () => void
}

export const SideMenuItem = ({
  icon: Icon,
  label,
  path,
  hint,
  counter,
  expanded,
  end,
  onNavigate,
}: SideMenuItemProps) => {
  return (
    <NavLink
      to={path}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'mx-2 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-sidebar-foreground transition-colors',
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          isActive && 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary',
          !expanded && 'justify-center'
        )
      }
      title={hint || label}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {expanded && <span className="flex-1 truncate">{label}</span>}
      {expanded && counter !== undefined && counter > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 font-mono text-xs text-primary-foreground">
          {counter}
        </span>
      )}
    </NavLink>
  )
}
