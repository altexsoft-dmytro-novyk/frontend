import { EyeOff, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { StatePanel } from '@/components/StatePanel/StatePanel'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { AccessJournalKind, AccessJournalRow } from '@/types/api'
import type { JournalStatus } from '../../hooks/useEmployeeOrganisationPage'
import { SectionCard } from '../SectionCard/SectionCard'
import { formatTimestamp, snapshotSummary } from '../../helpers/journalFormatters'

interface AccessJournalProps {
  status: JournalStatus
  rows: AccessJournalRow[]
  onRetry: () => void
}

const KIND_KEYS = {
  manager: 'organisation.journal.kind.manager',
  people_partner: 'organisation.journal.kind.peoplePartner',
  department_membership: 'organisation.journal.kind.departmentMembership',
  department_manager: 'organisation.journal.kind.departmentManager',
  full_profile_grant: 'organisation.journal.kind.fullProfileGrant',
  full_profile_revoke: 'organisation.journal.kind.fullProfileRevoke',
  shared_link_access: 'organisation.journal.kind.sharedLinkAccess',
} as const satisfies Record<AccessJournalKind, string>

export const AccessJournal = ({ status, rows, onRetry }: AccessJournalProps) => {
  const { t } = useTranslation()

  // `kind` is server data — fall back to the raw value for anything unexpected.
  const kindLabel = (kind: AccessJournalKind): string =>
    kind in KIND_KEYS ? t(KIND_KEYS[kind]) : kind

  return (
    <SectionCard testId="organisation-journal" title={t('organisation.journal.title')}>
      {status === 'loading' ? (
        <div
          className="space-y-2"
          role="status"
          aria-live="polite"
          aria-label={t('organisation.journal.loading')}
        >
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : status === 'forbidden' ? (
        <StatePanel
          icon={EyeOff}
          title={t('organisation.journal.forbidden.title')}
          body={t('organisation.journal.forbidden.body')}
          testId="organisation-journal-forbidden"
        />
      ) : status === 'error' ? (
        <StatePanel
          icon={TriangleAlert}
          title={t('organisation.journal.error.title')}
          body={t('organisation.journal.error.body')}
          actions={[{ label: t('organisation.journal.error.retry'), onClick: onRetry }]}
          testId="organisation-journal-error"
        />
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground" data-testid="organisation-journal-empty">
          {t('organisation.journal.empty')}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table data-testid="organisation-journal-table">
            <TableCaption className="sr-only">{t('organisation.journal.caption')}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>{t('organisation.journal.columns.occurredAt')}</TableHead>
                <TableHead>{t('organisation.journal.columns.kind')}</TableHead>
                <TableHead>{t('organisation.journal.columns.actor')}</TableHead>
                <TableHead>{t('organisation.journal.columns.before')}</TableHead>
                <TableHead>{t('organisation.journal.columns.after')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={row.id || `${row.kind}-${row.occurredAt}-${index}`}>
                  <TableCell className="font-mono text-xs whitespace-nowrap">
                    {formatTimestamp(row.occurredAt)}
                  </TableCell>
                  <TableCell>{kindLabel(row.kind)}</TableCell>
                  <TableCell className="font-mono text-xs">{row.actorUserId}</TableCell>
                  <TableCell className="font-mono text-xs">{snapshotSummary(row.before)}</TableCell>
                  <TableCell className="font-mono text-xs">{snapshotSummary(row.after)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </SectionCard>
  )
}
