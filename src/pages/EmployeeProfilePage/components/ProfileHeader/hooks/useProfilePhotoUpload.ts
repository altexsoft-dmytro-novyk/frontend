import { useRef, useState, type ChangeEvent } from 'react'
import { isAxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { useUploadEmployeePhoto } from '@/api/hooks/useUploadEmployeePhoto'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5 MiB — mirrors the backend limit
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Self-service photo upload for the profile header. Client-validates size and a
 * *known* disallowed type before the request (the backend enforces the same);
 * maps `413` → size, `415` → type, `503` → storage on the response.
 */
export const useProfilePhotoUpload = (id: string) => {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const mutation = useUploadEmployeePhoto(id)

  const openFilePicker = () => {
    setError(null)
    fileInputRef.current?.click()
  }

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // Reset the input so re-picking the same file fires `change` again.
    event.target.value = ''
    if (!file) {
      return
    }

    // Some browsers report an empty `type` for a perfectly valid image — don't
    // reject that client-side, let the server decide. Only block a KNOWN bad type.
    if (file.type !== '' && !ALLOWED_TYPES.includes(file.type)) {
      setError(t('profile.header.photoError.type'))
      return
    }
    if (file.size === 0 || file.size > MAX_PHOTO_BYTES) {
      setError(t('profile.header.photoError.size'))
      return
    }

    setError(null)
    mutation.mutate(file, {
      onError: mutationError => {
        const status = isAxiosError(mutationError) ? mutationError.response?.status : undefined
        if (status === 413) {
          setError(t('profile.header.photoError.size'))
          return
        }
        if (status === 415) {
          setError(t('profile.header.photoError.type'))
          return
        }
        setError(
          status === 503
            ? t('profile.header.photoError.storage')
            : t('profile.header.photoError.upload')
        )
      },
    })
  }

  return {
    fileInputRef,
    openFilePicker,
    onFileChange,
    isUploading: mutation.isPending,
    error,
  }
}
