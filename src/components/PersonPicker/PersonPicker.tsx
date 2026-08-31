import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useUsersList } from '@/api/hooks/useUsers'
import { cn } from '@/lib/utils'

interface PersonPickerProps {
  value: string | null
  onChange: (id: string | null) => void
  /** Ids to hide from the list (e.g. the current user, to prevent self-assignment). */
  excludeIds?: string[]
  placeholder?: string
}

export const PersonPicker = ({
  value,
  onChange,
  excludeIds = [],
  placeholder,
}: PersonPickerProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { data } = useUsersList({ pageSize: 200 })

  const all = data?.items ?? []
  const selected = all.find(u => u.id === value)
  const q = search.trim().toLowerCase()
  const options = all
    .filter(u => !excludeIds.includes(u.id))
    .filter(u =>
      q ? `${u.firstName} ${u.lastName} ${u.workEmail}`.toLowerCase().includes(q) : true
    )
    .slice(0, 20)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
          {selected
            ? `${selected.firstName} ${selected.lastName}`
            : (placeholder ?? t('relationships.pickPerson'))}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder={t('common.search')} value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>{t('commandPalette.empty')}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__clear"
                onSelect={() => {
                  onChange(null)
                  setOpen(false)
                }}
              >
                <Check className={cn('h-4 w-4', value === null ? 'opacity-100' : 'opacity-0')} />
                {t('relationships.clear')}
              </CommandItem>
              {options.map(person => (
                <CommandItem
                  key={person.id}
                  value={person.id}
                  onSelect={() => {
                    onChange(person.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn('h-4 w-4', value === person.id ? 'opacity-100' : 'opacity-0')}
                  />
                  <span>
                    {person.firstName} {person.lastName}
                  </span>
                  <span className="ml-auto truncate text-xs text-muted-foreground">
                    {person.position}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
