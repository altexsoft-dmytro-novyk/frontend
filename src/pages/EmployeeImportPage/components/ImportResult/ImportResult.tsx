import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ClipboardCheck, ClipboardCopy, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DASH } from '@/lib/employeeFormatters'
import type { ImportSummary } from '@/types/api'
import { useImportResult } from './hooks/useImportResult'

interface ImportResultProps {
  summary: ImportSummary
  onReset: () => void
}

export const ImportResult = ({ summary, onReset }: ImportResultProps) => {
  const { t } = useTranslation()

  const errors = Array.isArray(summary.errors) ? summary.errors : []
  const isClean = summary.skipped === 0 && errors.length === 0
  const { headingRef, copied, copySkippedRows } = useImportResult(errors)

  const counts: { key: string; label: string; value: number }[] = [
    { key: 'created', label: t('import.counts.created'), value: summary.created },
    { key: 'updated', label: t('import.counts.updated'), value: summary.updated },
    {
      key: 'departmentsCreated',
      label: t('import.counts.departmentsCreated'),
      value: summary.departmentsCreated,
    },
    { key: 'skipped', label: t('import.counts.skipped'), value: summary.skipped },
  ]

  return (
    <section
      className="space-y-4 rounded-lg border border-border bg-card p-4 sm:p-5"
      data-testid="import-result"
      role="status"
    >
      <div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-sm font-semibold text-foreground outline-none"
        >
          {isClean ? t('import.result.titleClean') : t('import.result.titlePartial')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isClean ? t('import.result.descriptionClean') : t('import.result.descriptionPartial')}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {counts.map(count => (
          <div
            key={count.key}
            className="rounded-lg border border-border bg-background p-3"
            data-testid={`import-count-${count.key}`}
          >
            <dt className="text-xs text-muted-foreground">{count.label}</dt>
            <dd className="mt-1 font-mono text-xl font-semibold text-foreground">{count.value}</dd>
          </div>
        ))}
      </dl>

      {errors.length > 0 ? (
        <div className="space-y-2" data-testid="import-errors">
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                void copySkippedRows()
              }}
              data-testid="import-copy-skipped"
            >
              {copied ? (
                <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ClipboardCopy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {copied ? t('import.copySkippedDone') : t('import.copySkipped')}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableCaption className="sr-only">{t('import.errors.caption')}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('import.errors.line')}</TableHead>
                  <TableHead>{t('import.errors.email')}</TableHead>
                  <TableHead>{t('import.errors.reason')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errors.map(rowError => (
                  <TableRow key={`${rowError.line}-${rowError.email ?? ''}`}>
                    <TableCell className="font-mono text-xs">{rowError.line}</TableCell>
                    <TableCell>
                      {rowError.email ?? <span className="text-muted-foreground">{DASH}</span>}
                    </TableCell>
                    <TableCell>{rowError.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onReset}
          data-testid="import-another"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          {t('import.importAnother')}
        </Button>
        <Button asChild size="sm" data-testid="import-view-directory">
          <Link to="/employees">
            {t('import.directoryLink')}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
