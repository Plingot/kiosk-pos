import { getProviders } from 'next-auth/react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import SignInButtons from './sign-in-buttons'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Nunito_Sans } from 'next/font/google'
import { Citrus } from 'lucide-react'
import { redirect } from '@/app/i18n/navigation'

const nunito = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '800'],
  variable: '--font-nunito',
})

export default async function SignInPage({
  searchParams,
  params,
}: {
  searchParams?: { callbackUrl?: string; error?: string }
  params: { locale: string }
}) {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect({ href: '/admin', locale: params?.locale || 'en' })
  }

  const providers = await getProviders()

  return (
    <main className="flex h-full flex-col justify-center lg:justify-normal">
      <div className="flex flex-col items-center lg:mt-20">
        <div className="mb-5 flex items-center gap-4">
          <h1 className={`${nunito.className} text-2xl font-bold flex`}>
            <Citrus className="h-7 w-7 mr-2" />
            KioskPOS
          </h1>
        </div>

        <div className="mb-10">
          <LanguageSwitcher className="w-[200px]" />
        </div>

        <SignInButtons
          providers={providers || {}}
          callbackUrl={searchParams?.callbackUrl}
        />
      </div>
    </main>
  )
}
