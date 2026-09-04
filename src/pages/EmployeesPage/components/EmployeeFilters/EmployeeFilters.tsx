import type { ParseKeys } from 'i18next'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  EmployeeFilterKey,
  EmployeeFilters as EmployeeFilterValues,
} from '../../hooks/useEmployeesPage'
import { useEmployeeFilters } from './hooks/useEmployeeFilters'

interface EmployeeFiltersProps {
  filters: EmployeeFilterValues
  hasActiveFilters: boolean
  onApply: (next: Partial<EmployeeFilterValues>) => void
  onClear: () => void
}

interface TextFieldConfig {
  key: Exclude<EmployeeFilterKey, 'employmentStatus'>
  type?: 'text' | 'email' | 'tel' | 'number' | 'date'
  min?: number
  max?: number
}

/** Sentinel for the "no employment-status filter" option (empty is reserved by Radix). */
const STATUS_ANY = 'any'

const TEXT_FIELDS: TextFieldConfig[] = [
  { key: 'firstName' },
  { key: 'lastName' },
  { key: 'position' },
  { key: 'country' },
  { key: 'city' },
  { key: 'workEmail', type: 'email' },
  { key: 'workPhone', type: 'tel' },
  { key: 'birthDay', type: 'number', min: 1, max: 31 },
  { key: 'birthMonth', type: 'number', min: 1, max: 12 },
  { key: 'companyJoinDate', type: 'date' },
]

const LABEL_KEYS = {
  firstName: 'employees.filters.firstName',
  lastName: 'employees.filters.lastName',
  position: 'employees.filters.position',
  country: 'employees.filters.country',
  city: 'employees.filters.city',
  workEmail: 'employees.filters.workEmail',
  workPhone: 'employees.filters.workPhone',
  birthDay: 'employees.filters.birthDay',
  birthMonth: 'employees.filters.birthMonth',
  companyJoinDate: 'employees.filters.companyJoinDate',
  employmentStatus: 'employees.filters.employmentStatus',
} as const satisfies Record<EmployeeFilterKey, ParseKeys>

export const EmployeeFilters = ({
  filters,
  hasActiveFilters,
  onApply,
  onClear,
}: EmployeeFiltersProps) => {
  const { t } = useTranslation()
  const { draft, setValue, submit } = useEmployeeFilters({ filters, onApply })

  return (
    <form className="rounded-lg border border-border bg-card p-4" onSubmit={submit} noValidate>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {TEXT_FIELDS.map(field => {
          const inputId = `employee-filter-${field.key}`
          return (
            <Field key={field.key}>
              <FieldLabel htmlFor={inputId}>{t(LABEL_KEYS[field.key])}</FieldLabel>
              <Input
                id={inputId}
                type={field.type ?? 'text'}
                inputMode={field.type === 'number' ? 'numeric' : undefined}
                min={field.min}
                max={field.max}
                value={draft[field.key]}
                onChange={event => setValue(field.key, event.target.value)}
              />
            </Field>
          )
        })}

        <Field>
          <FieldLabel htmlFor="employee-filter-employmentStatus">
            {t(LABEL_KEYS.employmentStatus)}
          </FieldLabel>
          <Select
            value={draft.employmentStatus || STATUS_ANY}
            onValueChange={value => setValue('employmentStatus', value === STATUS_ANY ? '' : value)}
          >
            <SelectTrigger
              id="employee-filter-employmentStatus"
              className="w-full"
              aria-label={t(LABEL_KEYS.employmentStatus)}
            >
              <SelectValue placeholder={t('employees.statusPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {/* "Any" sends no `employmentStatus` param, so `GET /users` applies
                  its default (active only) — it has no combined active+dismissed
                  query. That limitation is recorded in deferred-work.md. */}
              <SelectItem value={STATUS_ANY}>{t('employees.filters.statusAny')}</SelectItem>
              <SelectItem value="active">{t('employees.statusActive')}</SelectItem>
              <SelectItem value="dismissed">{t('employees.statusDismissed')}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm">
          {t('employees.applyFilters')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={!hasActiveFilters}
        >
          {t('employees.clearFilters')}
        </Button>
        <p className="ml-auto text-xs text-muted-foreground">{t('employees.exactMatchHint')}</p>
      </div>
    </form>
  )
}
