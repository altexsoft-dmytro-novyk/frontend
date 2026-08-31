import { useTranslation } from 'react-i18next'
import { Info, Shield, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { StateMessage } from '@/components/StateMessage/StateMessage'
import { useRolesPage } from './hooks/useRolesPage'

export const RolesPage = () => {
  const { t } = useTranslation()
  const { roles, isLoading, isError, refetch, revokeHolder, isRevoking } = useRolesPage()

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('roles.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('roles.subtitle')}</p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted p-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{t('roles.readOnlyNotice')}</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : isError ? (
        <StateMessage
          icon={TriangleAlert}
          title={t('roles.loadError')}
          action={
            <Button variant="outline" onClick={() => refetch()}>
              {t('common.retry')}
            </Button>
          }
        />
      ) : (
        <Accordion type="multiple" className="rounded-lg border border-border">
          {roles.map(role => (
            <AccordionItem key={role.id} value={role.id} className="px-4">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="font-medium text-foreground">{role.name}</span>
                  <Badge variant="secondary">
                    {t('roles.holderCount', { count: role.holderCount })}
                  </Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                {role.holders.length === 0 ? (
                  <p className="py-2 text-sm text-muted-foreground">{t('roles.noHolders')}</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {role.holders.map(holder => (
                      <li
                        key={holder.id}
                        className="flex items-center justify-between py-2 text-sm"
                      >
                        <span className="text-foreground">{holder.workEmail}</span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              {t('roles.revoke')}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('roles.revoke')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('roles.revokeConfirm', {
                                  role: role.name,
                                  email: holder.workEmail,
                                })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                              <AlertDialogAction
                                disabled={isRevoking}
                                onClick={() => {
                                  void revokeHolder(role.id, holder.id)
                                }}
                              >
                                {t('roles.revoke')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </li>
                    ))}
                  </ul>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
