'use client'

import type React from 'react'

import { redirect } from '@/app/i18n/navigation'
import { LogOut, Citrus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import { Nunito_Sans } from 'next/font/google'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useTranslation } from '@/hooks/use-translation'
import { SidebarMenuComponent } from '@/components/admin/sidebar-menu'

const nunito = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '800'],
  variable: '--font-nunito',
})

export default function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { data: session, status } = useSession()
  const { t } = useTranslation()

  const handleLogout = () => {
    signOut()
  }

  if (!session && status === 'unauthenticated') {
    return redirect({ href: '/auth/signin', locale: params?.locale || 'en' })
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full admin-styles">
        <Sidebar className="bg-background">
          <SidebarHeader className="p-6">
            <h1 className={`${nunito.className} text-xl font-bold flex`}>
              <Citrus className="h-6 w-6 mr-2" />
              KioskPOS
            </h1>
          </SidebarHeader>
          <SidebarMenuComponent />
          <SidebarFooter className="p-6">
            <LanguageSwitcher className="w-full" />
            <Button
              variant="outline"
              className="w-full rounded-full justify-center bg-gray-200 text-black"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('admin.layout.log-out')}
            </Button>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 overflow-auto">
          <div className="container p-6 mx-auto">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  )
}
