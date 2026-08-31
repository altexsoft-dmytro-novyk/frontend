import { useTranslation } from 'react-i18next'

export interface DefinitionItem {
  label: string
  value: string | number | null | undefined
}

interface DefinitionListProps {
  items: DefinitionItem[]
}

export const DefinitionList = ({ items }: DefinitionListProps) => {
  const { t } = useTranslation()
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {items.map(item => (
        <div key={item.label}>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</dt>
          <dd className="text-sm text-foreground">
            {item.value === null || item.value === undefined || item.value === ''
              ? t('common.notAvailable')
              : item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
