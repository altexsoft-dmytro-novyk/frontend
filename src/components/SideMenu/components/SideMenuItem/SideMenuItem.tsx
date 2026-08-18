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
  onNavigate?: () => void
}

export const SideMenuItem = ({
  icon: Icon,
  label,
  path,
  hint,
  counter,
  expanded,
  onNavigate,
}: SideMenuItemProps) => {
  return (
    <NavLink
      to={path}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-4 py-3 text-sidebar-foreground transition-colors',
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          isActive && 'bg-sidebar-primary text-sidebar-primary-foreground font-medium',
          !expanded && 'justify-center'
        )
      }
      title={hint || label}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {expanded && <span className="flex-1 truncate text-sm">{label}</span>}
      {expanded && counter !== undefined && counter > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
          {counter}
        </span>
      )}
    </NavLink>
  )
}
