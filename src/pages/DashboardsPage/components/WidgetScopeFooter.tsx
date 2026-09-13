import { Shield } from 'lucide-react'

interface WidgetScopeFooterProps {
  wscope: string
}

export const WidgetScopeFooter = ({ wscope }: WidgetScopeFooterProps) => {
  return (
    <div className="wscope" data-slot="widget-scope-footer">
      <Shield className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span>{wscope}</span>
    </div>
  )
}
