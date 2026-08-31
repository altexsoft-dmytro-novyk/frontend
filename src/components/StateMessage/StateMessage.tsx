import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface StateMessageProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export const StateMessage = ({ icon: Icon, title, description, action }: StateMessageProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center">
      <Icon className="h-8 w-8 text-muted-foreground" />
      <div className="space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
