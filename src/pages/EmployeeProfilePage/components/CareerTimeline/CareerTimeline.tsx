import { isAxiosError } from 'axios'
import { TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCareerEvents } from '@/api/hooks/useCareerEvents'
import { StatePanel } from '@/components/StatePanel/StatePanel'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatIsoDate } from '@/lib/employeeFormatters'
import type { CareerEvent } from '@/types/api'
import { AddEventDialog } from './AddEventDialog'
import { DeleteEventButton } from './DeleteEventButton'

interface CareerTimelineProps {
  employeeId: string
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const EventDetails = ({ details }: { details: unknown }) => {
  const { t } = useTranslation()
  const entries = isPlainObject(details) ? Object.entries(details) : []
  if (entries.length === 0) {
    return <span className="text-xs text-muted-foreground">{t('profile.timeline.noDetails')}</span>
  }
  return (
    <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
      {entries.map(([key, value]) => (
        <div key={key} className="contents">
          <dt className="text-muted-foreground">{key}</dt>
          <dd className="text-foreground">
            {typeof value === 'string' ? value : JSON.stringify(value)}
          </dd>
        </div>
      ))}
    </dl>
  )
}

const EventRow = ({
  event,
  employeeId,
  canEdit,
}: {
  event: CareerEvent
  employeeId: string
  canEdit: boolean
}) => {
  const { t } = useTranslation()
  const isManual = event.source === 'manual'
  return (
    <li className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">{event.type}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {formatIsoDate(event.eventDate)}
          </span>
          <Badge variant={isManual ? 'secondary' : 'outline'}>
            {isManual ? t('profile.timeline.sourceManual') : t('profile.timeline.sourceSystem')}
          </Badge>
        </div>
        <EventDetails details={event.details} />
      </div>
      {canEdit ? <DeleteEventButton employeeId={employeeId} eventId={event.id} /> : null}
    </li>
  )
}

export const CareerTimeline = ({ employeeId }: CareerTimelineProps) => {
  const { t } = useTranslation()
  const query = useCareerEvents(employeeId)
  const errorStatus = isAxiosError(query.error) ? query.error.response?.status : undefined

  const events = Array.isArray(query.data?.data) ? query.data.data : []
  const canEdit = query.data?.canEdit === true
  // A `200` whose body is missing `data` is as broken as a `5xx` — not "empty".
  const malformed = query.isSuccess && !Array.isArray(query.data?.data)
  const isForbidden = query.isError && errorStatus === 403
  const isError = (query.isError && !isForbidden) || malformed

  return (
    <section
      className="rounded-lg border border-border bg-card p-4 sm:p-5"
      data-testid="profile-career-timeline"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">{t('profile.timeline.title')}</h2>
        {query.isSuccess && !malformed && canEdit ? (
          <AddEventDialog employeeId={employeeId} />
        ) : null}
      </div>

      <div className="mt-3">
        {query.isLoading ? (
          <div
            className="space-y-2"
            data-testid="timeline-loading"
            role="status"
            aria-live="polite"
            aria-label={t('profile.timeline.loading')}
          >
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isForbidden ? (
          <p className="text-sm text-muted-foreground" data-testid="timeline-forbidden">
            {t('profile.timeline.forbidden')}
          </p>
        ) : isError ? (
          <StatePanel
            icon={TriangleAlert}
            title={t('profile.timeline.error.title')}
            body={t('profile.timeline.error.body')}
            actions={[
              {
                label: t('profile.timeline.error.retry'),
                onClick: () => {
                  void query.refetch()
                },
              },
            ]}
            testId="timeline-error"
          />
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground" data-testid="timeline-empty">
            {t('profile.timeline.empty')}
          </p>
        ) : (
          <ul className="divide-y divide-border" data-testid="timeline-list">
            {events.map(event => (
              <EventRow key={event.id} event={event} employeeId={employeeId} canEdit={canEdit} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
