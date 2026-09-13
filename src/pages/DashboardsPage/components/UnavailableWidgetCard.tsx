import { AlertCircle, type LucideIcon } from 'lucide-react'
import type { UnavailableWidgetState } from '@/types/dashboards'

interface UnavailableWidgetCardProps {
  slot: 'riskCounts' | 'unitActionItems' | 'myActionItems' | 'resourcingRequests' | 'openCampaigns'
  state: UnavailableWidgetState
  icon?: LucideIcon
}

export const UnavailableWidgetCard = ({
  slot,
  state,
  icon: Icon = AlertCircle,
}: UnavailableWidgetCardProps) => {
  const titleId = `dashboard-${slot}-title`

  return (
    <section
      data-slot={slot}
      aria-labelledby={titleId}
      className="flex flex-col justify-between rounded-xl border border-dashed border-border bg-card/60 p-5 shadow-xs"
    >
      <div className="text-xs text-muted-foreground leading-relaxed">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 id={titleId} className="text-sm font-medium text-foreground">
            {state.missingCapability}
          </h3>
          <Icon className="h-4 w-4 text-muted-foreground/70 shrink-0" aria-hidden="true" />
        </div>
        <div className="mb-2">
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-mono font-medium text-muted-foreground">
            Unavailable
          </span>
        </div>
        {state.unavailableReason}
      </div>
    </section>
  )
}
