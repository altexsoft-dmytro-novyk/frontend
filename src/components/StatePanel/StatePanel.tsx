import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface StatePanelAction {
  label: string
  onClick: () => void
}

interface StatePanelLink {
  label: string
  to: string
}

interface StatePanelProps {
  icon: LucideIcon
  title: string
  body: string
  actions?: StatePanelAction[]
  link?: StatePanelLink
  testId?: string
}

/**
 * The shared non-content state layout — forbidden / bad-request / error / empty /
 * unavailable — used by the directory and the profile screen: icon, bold line,
 * direction, optional action(s) (design-notes `.emptyst`).
 */
export const StatePanel = ({
  icon: Icon,
  title,
  body,
  actions = [],
  link,
  testId,
}: StatePanelProps) => {
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
      {(actions.length > 0 || link) && (
        <div className="flex flex-wrap justify-center gap-2">
          {actions.map(action => (
            <Button key={action.label} variant="outline" size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          ))}
          {link && (
            <Button asChild variant="outline" size="sm">
              <Link to={link.to}>{link.label}</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
