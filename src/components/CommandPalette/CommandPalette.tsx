import { useTranslation } from 'react-i18next'
import { Shield, User, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useCommandPalette } from './hooks/useCommandPalette'

export const CommandPalette = () => {
  const { t } = useTranslation()
  const { me, can } = useAuth()
  const { open, setOpen, query, setQuery, people, go, openPerson } = useCommandPalette()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0" showCloseButton={false}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t('commandPalette.placeholder')}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>{t('commandPalette.empty')}</CommandEmpty>

            {people.length > 0 && (
              <CommandGroup heading={t('commandPalette.peopleGroup')}>
                {people.map(person => (
                  <CommandItem
                    key={person.id}
                    value={person.id}
                    onSelect={() => openPerson(person)}
                  >
                    <User className="h-4 w-4" />
                    <span>
                      {person.firstName} {person.lastName}
                    </span>
                    <span className="ml-auto truncate text-xs text-muted-foreground">
                      {person.position}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandSeparator />
            <CommandGroup heading={t('commandPalette.navGroup')}>
              <CommandItem value="nav-people" onSelect={() => go('/people')}>
                <Users className="h-4 w-4" />
                {t('commandPalette.openDirectory')}
              </CommandItem>
              {me && (
                <CommandItem value="nav-me" onSelect={() => go(`/people/${me.id}`)}>
                  <User className="h-4 w-4" />
                  {t('commandPalette.openMyProfile')}
                </CommandItem>
              )}
              {can('manage_roles') && (
                <CommandItem value="nav-roles" onSelect={() => go('/admin/roles')}>
                  <Shield className="h-4 w-4" />
                  {t('commandPalette.openRoles')}
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
