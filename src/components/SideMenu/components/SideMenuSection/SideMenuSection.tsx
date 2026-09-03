import { type ReactNode } from 'react'

interface SideMenuSectionProps {
  /** Uppercase group label (prototype's "Administration" header treatment). Omit for the top group. */
  title?: string
  /** Whether labels are visible (sidebar expanded or mobile drawer open). */
  showLabels: boolean
  children: ReactNode
}

export const SideMenuSection = ({ title, showLabels, children }: SideMenuSectionProps) => {
  return (
    <div className="flex flex-col gap-px">
      {title && showLabels && (
        <p className="px-3 pt-3.5 pb-1.5 font-mono text-[0.65rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          {title}
        </p>
      )}
      {children}
    </div>
  )
}
