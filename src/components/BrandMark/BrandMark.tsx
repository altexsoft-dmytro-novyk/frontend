import { Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface BrandMarkProps {
  /** Hide the wordmark, show only the glyph tile. */
  glyphOnly?: boolean
  className?: string
}

/**
 * The "PeoplePlatform" brand lockup from the prototype: a rounded accent tile
 * with a glyph, followed by the wordmark. Presentational only.
 */
export const BrandMark = ({ glyphOnly = false, className }: BrandMarkProps) => {
  const { t } = useTranslation()

  return (
    <span className={cn('flex items-center gap-2 font-semibold', className)}>
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Users className="h-3.5 w-3.5" />
      </span>
      {!glyphOnly && <span className="text-sm tracking-tight">{t('shell.brand')}</span>}
    </span>
  )
}
