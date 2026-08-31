import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Search, TriangleAlert, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { StateMessage } from '@/components/StateMessage/StateMessage'
import { PeopleTable } from './components/PeopleTable/PeopleTable'
import { usePeoplePage } from './hooks/usePeoplePage'

export const PeoplePage = () => {
  const { t } = useTranslation()
  const {
    tab,
    setTab,
    search,
    onSearchChange,
    rows,
    totalCount,
    page,
    totalPages,
    setPage,
    isLoading,
    isError,
    refetch,
  } = usePeoplePage()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('directory.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('directory.subtitle', { count: totalCount })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={tab} onValueChange={v => setTab(v as 'active' | 'dismissed')}>
          <TabsList>
            <TabsTrigger value="active">{t('directory.tabActive')}</TabsTrigger>
            <TabsTrigger value="dismissed">{t('directory.tabDismissed')}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder={t('directory.searchPlaceholder')}
            value={search}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <StateMessage
          icon={TriangleAlert}
          title={t('directory.loadError')}
          action={
            <Button variant="outline" onClick={() => refetch()}>
              {t('common.retry')}
            </Button>
          }
        />
      ) : rows.length === 0 ? (
        <StateMessage icon={Users} title={t('directory.empty')} />
      ) : (
        <>
          <PeopleTable rows={rows} />
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t('directory.page', { page })} / {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('directory.prev')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  {t('directory.next')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
