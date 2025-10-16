'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/use-translation'

interface Props {
  // oxlint-disable-next-line no-explicit-any
  providers?: Record<string, any>
  callbackUrl?: string
}

export default function SignInButtons({ providers, callbackUrl }: Props) {
  const { t } = useTranslation()

  if (!providers) {
    return null
  }

  return (
    <>
      {Object.values(providers).map((provider) => (
        <Button
          key={provider.id}
          className="mx-auto flex w-[300px] items-center gap-3 bg-white hover:bg-gray-100 focus:bg-gray-100"
          onClick={() =>
            signIn(provider.id, { callbackUrl: callbackUrl || '/admin' })
          }
        >
          {t('auth.continue_with', { provider: provider.name })}
        </Button>
      ))}
    </>
  )
}
