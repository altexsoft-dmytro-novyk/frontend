import { ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { DashboardHeaderMetadata } from '@/types/dashboards'

interface PageHeaderBandProps {
  header?: DashboardHeaderMetadata
  title?: string
  lead?: string
}

export const PageHeaderBand = ({ header, title, lead }: PageHeaderBandProps) => {
  const { t } = useTranslation()

  const eyebrow = header?.eyebrow ?? t('dashboards.eyebrow')
  const provTag = header?.provenanceTag ?? t('dashboards.provenanceTag')

  return (
    <header className="pghd pb-4 border-b border-border" role="banner">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <span className="text-[10px] font-mono font-medium uppercase tracking-[0.15em] text-muted-foreground">
          {eyebrow}
        </span>
        <span className="prov access">
          <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>{provTag}</span>
        </span>
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
        {title ?? t('dashboards.title')}
      </h1>
      <p className="text-xs md:text-sm text-muted-foreground mt-1">
        {lead ?? t('dashboards.lead')}
      </p>
    </header>
  )
}
