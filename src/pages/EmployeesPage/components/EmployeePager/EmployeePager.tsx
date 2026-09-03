import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmployeePagerProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const EmployeePager = ({ page, totalPages, onPageChange }: EmployeePagerProps) => {
  const { t } = useTranslation()

  const effectiveTotal = Math.max(totalPages, 1)
  const atStart = page <= 1
  const atEnd = page >= effectiveTotal

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" disabled={atStart} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
        {t('employees.pager.previous')}
      </Button>
      <span
        className="font-mono text-xs text-muted-foreground"
        data-testid="employees-pager-position"
      >
        {t('employees.pager.position', { page, totalPages: effectiveTotal })}
      </span>
      <Button variant="outline" size="sm" disabled={atEnd} onClick={() => onPageChange(page + 1)}>
        {t('employees.pager.next')}
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
    </div>
  )
}
