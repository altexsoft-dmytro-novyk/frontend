import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { usePersonPicker, type PickerPerson } from './hooks/usePersonPicker'

interface PersonPickerProps {
  title: string
  description: string
  /** People that can't be picked (the subject, the already-assigned person). */
  excludeIds: string[]
  /** A write is in flight — freeze row selection so a double-click can't fire twice. */
  busy: boolean
  onPick: (person: PickerPerson) => void
  onClose: () => void
}

/**
 * A dialog that lists people from `GET /users` (HR-Admin-gated — the same actor
 * who can write org relationships can list) and returns the chosen row. The
 * directory has no substring search: a wide first page is filtered client-side,
 * and the exact-match inputs reach anyone that page doesn't contain. A `403`
 * from the directory disables the picker.
 */
export const PersonPicker = ({
  title,
  description,
  excludeIds,
  busy,
  onPick,
  onClose,
}: PersonPickerProps) => {
  const { t } = useTranslation()
  const {
    quickFilter,
    setQuickFilter,
    filters,
    setFilters,
    people,
    status,
    truncated,
    fetchedCount,
    totalMatches,
  } = usePersonPicker(excludeIds)

  return (
    <Dialog open onOpenChange={next => (next ? undefined : onClose())}>
      <DialogContent data-testid="person-picker">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {status === 'forbidden' ? (
          <p className="text-sm text-muted-foreground" data-testid="person-picker-forbidden">
            {t('organisation.picker.forbidden')}
          </p>
        ) : status === 'error' ? (
          <p className="text-sm text-destructive" role="alert">
            {t('organisation.picker.error')}
          </p>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                className="pl-8"
                placeholder={t('organisation.picker.filterPlaceholder')}
                aria-label={t('organisation.picker.filterLabel')}
                value={quickFilter}
                onChange={event => setQuickFilter(event.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(['firstName', 'lastName', 'workEmail'] as const).map(key => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={`picker-${key}`} className="text-xs text-muted-foreground">
                    {t(`organisation.picker.exact.${key}`)}
                  </Label>
                  <Input
                    id={`picker-${key}`}
                    value={filters[key]}
                    onChange={event => setFilters(prev => ({ ...prev, [key]: event.target.value }))}
                  />
                </div>
              ))}
            </div>

            {status === 'loading' ? (
              <div
                className="space-y-2"
                role="status"
                aria-live="polite"
                aria-label={t('organisation.picker.loading')}
              >
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : status === 'empty' ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {t('organisation.picker.empty')}
              </p>
            ) : (
              <>
                {truncated ? (
                  <p
                    className="text-xs text-muted-foreground"
                    data-testid="person-picker-truncated"
                  >
                    {t('organisation.picker.truncated', {
                      shown: fetchedCount,
                      total: totalMatches,
                    })}
                  </p>
                ) : null}
                <ul
                  className="max-h-72 divide-y divide-border overflow-y-auto rounded-md border border-border"
                  data-testid="person-picker-list"
                >
                  {people.map(person => (
                    <li key={person.id}>
                      <button
                        type="button"
                        disabled={busy}
                        className="flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-muted focus-visible:bg-muted focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                        onClick={() => {
                          if (!busy) {
                            onPick(person)
                          }
                        }}
                      >
                        <span className="text-sm font-medium text-foreground">{person.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {person.position} · {person.workEmail}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
