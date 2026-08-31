import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useRequestMagicLink } from '@/api/hooks/useAuth'

export const useLoginPage = () => {
  const { t } = useTranslation()
  const [sentTo, setSentTo] = useState<string | null>(null)
  const requestLink = useRequestMagicLink()

  const schema = z.object({
    email: z.string().email(t('auth.invalidEmail')),
  })
  type FormValues = z.infer<typeof schema>

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = form.handleSubmit(async ({ email }) => {
    await requestLink.mutateAsync(email.trim().toLowerCase())
    setSentTo(email.trim().toLowerCase())
  })

  const reset = () => {
    setSentTo(null)
    form.reset()
  }

  return {
    form,
    onSubmit,
    reset,
    sentTo,
    isSubmitting: requestLink.isPending,
    failed: requestLink.isError,
  }
}
