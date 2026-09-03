import { useTranslation } from 'react-i18next'
import { Lock, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useFilePicker } from './hooks/useFilePicker'

interface FilePickerProps {
  file: File | null
  canWrite: boolean
  isUploading: boolean
  onSelect: (file: File | null) => void
  onSubmit: () => void
}

const looksLikeCsv = (name: string): boolean => name.toLowerCase().endsWith('.csv')

export const FilePicker = ({
  file,
  canWrite,
  isUploading,
  onSelect,
  onSubmit,
}: FilePickerProps) => {
  const { t } = useTranslation()
  const { handleChange, handleSubmit } = useFilePicker({ onSelect, onSubmit })

  const isEmptyFile = file !== null && file.size === 0
  const showCsvHint = file !== null && !isEmptyFile && !looksLikeCsv(file.name)

  return (
    <form
      className="space-y-4 rounded-lg border border-border bg-card p-4 sm:p-5"
      onSubmit={handleSubmit}
      noValidate
      data-testid="import-file-picker"
    >
      {!canWrite ? (
        <p
          className="flex items-center gap-2 text-sm text-muted-foreground"
          role="status"
          data-testid="import-permission-notice"
        >
          <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t('import.permissionNotice')}
        </p>
      ) : null}

      <Field>
        <FieldLabel htmlFor="import-file">{t('import.fileLabel')}</FieldLabel>
        <Input
          id="import-file"
          type="file"
          accept=".csv,text/csv"
          disabled={!canWrite || isUploading}
          onChange={handleChange}
        />
        <FieldDescription>{t('import.expectedFileHint')}</FieldDescription>
      </Field>

      {file ? (
        <p className="text-sm text-foreground" data-testid="import-selected-file">
          {t('import.selectedFile', { name: file.name })}
        </p>
      ) : null}

      {isEmptyFile ? (
        <p className="text-sm text-muted-foreground" data-testid="import-empty-file-hint">
          {t('import.emptyFileHint')}
        </p>
      ) : null}

      {showCsvHint ? (
        <p className="text-sm text-muted-foreground" data-testid="import-csv-hint">
          {t('import.csvHint')}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={!canWrite || isUploading || file === null || isEmptyFile}
          data-testid="import-submit"
        >
          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
          {isUploading ? t('import.submitting') : t('import.submit')}
        </Button>
      </div>
    </form>
  )
}
