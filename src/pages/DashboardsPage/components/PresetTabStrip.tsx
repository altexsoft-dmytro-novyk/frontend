import { useRef, type KeyboardEvent } from 'react'
import { Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export const PresetTabStrip = () => {
  const { t } = useTranslation()
  const tabRef = useRef<HTMLButtonElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      tabRef.current?.focus()
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-2">
      {/* Preset tabs strip */}
      <div
        role="tablist"
        aria-label="Dashboard Presets"
        className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
      >
        <button
          ref={tabRef}
          role="tab"
          id="preset-tab-unit-manager"
          aria-selected="true"
          aria-controls="preset-panel-unit-manager"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className={cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs md:text-sm font-medium ring-offset-background transition-all',
            'bg-background text-foreground shadow-xs'
          )}
        >
          {t('dashboards.presets.unitManager')}
        </button>
      </div>

      {/* Grouping dimension control */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium">Dimension:</span>
        <div className="inline-flex h-8 items-center rounded-md border border-border bg-card p-0.5">
          <button
            type="button"
            role="button"
            data-grouping="people"
            data-state="active"
            aria-pressed="true"
            className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground shadow-xs"
          >
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t('dashboards.grouping.people')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
