import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldAlert, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { FilePicker } from './components/FilePicker/FilePicker'
import { ImportResult } from './components/ImportResult/ImportResult'
import { useEmployeeImportPage } from './hooks/useEmployeeImportPage'

export const EmployeeImportPage = () => {
  const { t } = useTranslation()
  const {
    file,
    phase,
    result,
    fileErrorMessage,
    serverErrorMessage,
    canWrite,
    confirmOpen,
    selectFile,
    requestSubmit,
    confirmSubmit,
    cancelConfirm,
    reset,
  } = useEmployeeImportPage()

  const alertMessage =
    phase === 'fileError' ? fileErrorMessage : phase === 'error' ? serverErrorMessage : null

  const alertRef = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    if (alertMessage) {
      alertRef.current?.focus()
    }
  }, [alertMessage])

  return (
    <div className="space-y-6">
      <div className="border-t-[length:var(--page-band-tick)] border-t-primary border-b border-b-border pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-[0.7rem] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            {t('import.eyebrow')}
          </p>
          <span className="inline-flex items-center gap-1.5 border-l-2 border-provenance-access pl-1.5 font-mono text-[0.65rem] font-medium tracking-[0.06em] text-provenance-access uppercase">
            <ShieldAlert className="h-3 w-3" aria-hidden="true" />
            {t('import.provenanceTag')}
          </span>
        </div>
        <Link
          to="/employees"
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          data-testid="import-back-link"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {t('import.directoryLink')}
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-foreground" data-testid="import-title">
          {t('import.title')}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('import.lead')}</p>
      </div>

      {phase === 'done' && result ? (
        <ImportResult summary={result} onReset={reset} />
      ) : (
        <>
          {alertMessage ? (
            <p
              ref={alertRef}
              tabIndex={-1}
              className="flex items-center gap-2 rounded-lg border border-border bg-card p-4 text-sm text-destructive outline-none"
              role="alert"
              data-testid={phase === 'fileError' ? 'import-file-error' : 'import-error'}
            >
              <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
              {alertMessage}
            </p>
          ) : null}

          <FilePicker
            file={file}
            canWrite={canWrite}
            isUploading={phase === 'uploading'}
            onSelect={selectFile}
            onSubmit={requestSubmit}
          />
        </>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={next => (next ? undefined : cancelConfirm())}>
        <AlertDialogContent data-testid="import-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('import.confirm.title', { name: file?.name ?? '' })}
            </AlertDialogTitle>
            <AlertDialogDescription>{t('import.confirm.body')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('import.confirm.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={event => {
                event.preventDefault()
                void confirmSubmit()
              }}
              data-testid="import-confirm-submit"
            >
              {t('import.confirm.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
