import { useTranslation } from 'react-i18next'
import { PersonPicker } from '@/components/PersonPicker/PersonPicker'
import { Button } from '@/components/ui/button'
import type {
  BlockedDepartureResponse,
  DepartureBlocker,
  DepartureBlockerKind,
  DepartureView,
  RecordDeparturePayload,
} from '@/types/api'
import { useBlockerResolution } from './hooks/useBlockerResolution'

interface BlockerPanelProps {
  routeId: string
  response: BlockedDepartureResponse
  payload: RecordDeparturePayload
  canWrite: boolean
  onWriteForbidden: () => void
  onRecorded: (view: DepartureView) => boolean
  onBlocked: (response: BlockedDepartureResponse, payload: RecordDeparturePayload) => void
  onBackToForm: () => void
  idempotencyKeyFor: (payload: RecordDeparturePayload, forceFresh?: boolean) => string
}

const KNOWN_KINDS: DepartureBlockerKind[] = [
  'direct_report',
  'department_manager',
  'people_partner',
]

const BlockerEntry = ({ blocker }: { blocker: DepartureBlocker }) => {
  const { t } = useTranslation()
  const known = (KNOWN_KINDS as string[]).includes(blocker.kind)
  return (
    <li className="rounded-md border border-border p-3" data-testid="departure-blocker">
      {known ? (
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {t(`departure.blockers.kind.${blocker.kind}`)}
        </p>
      ) : null}
      <p className="mt-0.5 text-sm text-foreground">{blocker.summary}</p>
      {blocker.targets && blocker.targets.length > 0 ? (
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {blocker.targets.map(target => (
            <li
              key={target.userId}
              className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
            >
              {target.name}
            </li>
          ))}
        </ul>
      ) : null}
      {blocker.departmentName ? (
        <p className="mt-1 text-xs text-muted-foreground">{blocker.departmentName}</p>
      ) : null}
    </li>
  )
}

export const BlockerPanel = ({
  routeId,
  response,
  payload,
  canWrite,
  onWriteForbidden,
  onRecorded,
  onBlocked,
  onBackToForm,
  idempotencyKeyFor,
}: BlockerPanelProps) => {
  const { t } = useTranslation()
  const {
    pickerOpen,
    openPicker,
    closePicker,
    reparentTo,
    recordNow,
    error,
    resolution,
    externalRemaining,
    reassigned,
    hasDefaultTarget,
    defaultTargetId,
    defaultTargetName,
    isBusy,
  } = useBlockerResolution({
    routeId,
    response,
    payload,
    onWriteForbidden,
    onRecorded,
    onBlocked,
    idempotencyKeyFor,
  })

  const reassignedSummary = reassigned
    ? [
        reassigned.directReports > 0
          ? t('departure.blockers.reassigned.directReports', { count: reassigned.directReports })
          : null,
        reassigned.peoplePartnerAssignments > 0
          ? t('departure.blockers.reassigned.peoplePartner', {
              count: reassigned.peoplePartnerAssignments,
            })
          : null,
        reassigned.departmentManager ? t('departure.blockers.reassigned.departmentManager') : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : ''

  return (
    <section
      className="rounded-lg border border-border bg-card p-4 sm:p-5"
      data-testid="departure-blockers"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2
          id="departure-phase-heading"
          tabIndex={-1}
          className="text-sm font-semibold text-foreground outline-none"
        >
          {t('departure.blockers.title')}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBackToForm}
          data-testid="departure-blockers-back"
        >
          {t('departure.blockers.backToForm')}
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{t('departure.blockers.description')}</p>

      <ul className="mt-3 space-y-2">
        {response.blockers.map((blocker, index) => (
          <BlockerEntry key={`${blocker.kind}-${index}`} blocker={blocker} />
        ))}
      </ul>

      {canWrite && resolution === 'pending' ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {hasDefaultTarget ? (
            <Button
              type="button"
              size="sm"
              disabled={isBusy}
              onClick={() => void reparentTo(defaultTargetId)}
              data-testid="departure-reparent-default"
            >
              {defaultTargetName
                ? t('departure.blockers.reparentToDefault', { name: defaultTargetName })
                : t('departure.blockers.reparentToDefaultManager')}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isBusy}
            onClick={openPicker}
            data-testid="departure-reparent-choose"
          >
            {t('departure.blockers.chooseSomeoneElse')}
          </Button>
        </div>
      ) : null}

      {!canWrite ? (
        <p
          className="mt-3 text-sm text-muted-foreground"
          data-testid="departure-permission-notice"
          role="status"
        >
          {t('departure.permissionNotice')}
        </p>
      ) : null}

      {resolution === 'cleared' ? (
        <div className="mt-4 space-y-2" data-testid="departure-blockers-cleared" role="status">
          <p className="text-sm text-foreground">{t('departure.blockers.cleared')}</p>
          {reassignedSummary ? (
            <p className="text-xs text-muted-foreground" data-testid="departure-reassigned-summary">
              {t('departure.blockers.reassignedPrefix')} {reassignedSummary}
            </p>
          ) : null}
          <Button
            type="button"
            size="sm"
            disabled={isBusy}
            onClick={() => void recordNow()}
            data-testid="departure-record-now"
          >
            {t('departure.blockers.recordNow')}
          </Button>
        </div>
      ) : null}

      {resolution === 'external-remain' ? (
        <div className="mt-4 space-y-1" data-testid="departure-blockers-external" role="status">
          {reassignedSummary ? (
            <p className="text-xs text-muted-foreground">
              {t('departure.blockers.reassignedPrefix')} {reassignedSummary}
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            {t('departure.blockers.externalRemaining', { count: externalRemaining })}
          </p>
        </div>
      ) : null}

      {error ? (
        <p
          className="mt-3 text-sm text-destructive"
          role="alert"
          data-testid="departure-blockers-error"
        >
          {error}
        </p>
      ) : null}

      {pickerOpen ? (
        <PersonPicker
          title={t('departure.blockers.pickerTitle')}
          description={t('departure.blockers.pickerDescription')}
          excludeIds={[routeId]}
          busy={isBusy}
          onPick={person => void reparentTo(person.id)}
          onClose={closePicker}
        />
      ) : null}
    </section>
  )
}
