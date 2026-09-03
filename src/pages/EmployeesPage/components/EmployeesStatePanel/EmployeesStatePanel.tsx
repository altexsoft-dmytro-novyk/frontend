import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmployeesStatePanelAction {
  label: string
  onClick: () => void
}

interface EmployeesStatePanelProps {
  icon: LucideIcon
  title: string
  body: string
  actions?: EmployeesStatePanelAction[]
  testId?: string
}

/**
 * The directory's non-table states — forbidden / bad-request / error / empty —
 * share one layout: icon, bold line, direction, optional action(s)
 * (design-notes `.emptyst`).
 */
export const EmployeesStatePanel = ({
  icon: Icon,
  title,
  body,
  actions = [],
  testId,
}: EmployeesStatePanelProps) => {
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card px-6 py-12 text-center"
      data-testid={testId}
      role="status"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
      {actions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {actions.map(action => (
            <Button key={action.label} variant="outline" size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
