import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { useRequestMagicLink } from '@/api/hooks/useRequestMagicLink'

const buildSchema = (invalidMessage: string) =>
  z.object({
    email: z.string().min(1, invalidMessage).email(invalidMessage),
  })

export type LoginFormValues = z.infer<ReturnType<typeof buildSchema>>

export const useLoginPage = () => {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const requestMagicLink = useRequestMagicLink()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(buildSchema(t('auth.login.emailInvalid'))),
    defaultValues: { email: '' },
    mode: 'onSubmit',
  })

  const onSubmit = form.handleSubmit(async values => {
    requestMagicLink.reset()
    await requestMagicLink.mutateAsync({ email: values.email }).catch(() => {
      // Swallowed: the error surfaces via `requestMagicLink.isError` below and
      // the form is re-enabled automatically once the mutation settles.
    })
  })

  const resetToForm = () => {
    requestMagicLink.reset()
    form.reset({ email: '' })
  }

  return {
    form,
    onSubmit,
    isAuthenticated,
    // Enumeration-safe: a successful POST always lands here, whatever the address.
    isSubmitted: requestMagicLink.isSuccess,
    isSubmitting: requestMagicLink.isPending,
    hasError: requestMagicLink.isError,
    resetToForm,
  }
}
