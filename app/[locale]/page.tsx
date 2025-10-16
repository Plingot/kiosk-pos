'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Cloud,
  Github,
  Download,
  Citrus,
  Link2,
  CreditCard,
  TabletSmartphone,
  LogIn,
  FolderTree,
  Layers,
  Package,
  FileText,
  Database,
  Computer,
  Moon,
  Sun,
  LayoutDashboard,
  Languages,
} from 'lucide-react'
import { Link } from '@/app/i18n/navigation'
import { useTheme } from 'next-themes'
import { useCallback, useMemo } from 'react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useTranslation } from '@/hooks/use-translation'
import Image from 'next/image'

export default function Home() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()

  const isLight = theme === 'light'
  const toggleTheme = useCallback(
    () => setTheme(isLight ? 'dark' : 'light'),
    [isLight, setTheme],
  )

  type Feature = {
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    accentClass: string
  }

  const features: Feature[] = useMemo(
    () => [
      {
        title: t('homepage.features.self-hosted.title'),
        description: t('homepage.features.self-hosted.description'),
        icon: Cloud,
        accentClass: 'bg-primary/10',
      },
      {
        title: t('homepage.features.admin-interface.title'),
        description: t('homepage.features.admin-interface.description'),
        icon: LayoutDashboard,
        accentClass: 'bg-primary/10',
      },
      {
        title: t('homepage.features.database.title'),
        description: t('homepage.features.database.description'),
        icon: Database,
        accentClass: 'bg-primary/10',
      },
      {
        title: t('homepage.features.invoicing-billing.title'),
        description: t('homepage.features.invoicing-billing.description'),
        icon: FileText,
        accentClass: 'bg-primary/10',
      },
      {
        title: t('homepage.features.stock-management.title'),
        description: t('homepage.features.stock-management.description'),
        icon: Package,
        accentClass: 'bg-primary/10',
      },
      {
        title: t('homepage.features.product-variants.title'),
        description: t('homepage.features.product-variants.description'),
        icon: Layers,
        accentClass: 'bg-primary/10',
      },
      {
        title: t('homepage.features.categories-requests.title'),
        description: t('homepage.features.categories-requests.description'),
        icon: FolderTree,
        accentClass: 'bg-primary/10',
      },
      {
        title: t('homepage.features.google-login.title'),
        description: t('homepage.features.google-login.description'),
        icon: LogIn,
        accentClass: 'bg-primary/10',
      },
      {
        title: t('homepage.features.user-friendly-pos.title'),
        description: t('homepage.features.user-friendly-pos.description'),
        icon: TabletSmartphone,
        accentClass: 'bg-primary/10',
      },
      {
        title: t('homepage.features.guest-payments.title'),
        description: t('homepage.features.guest-payments.description'),
        icon: CreditCard,
        accentClass: 'bg-primary/10',
      },
      {
        title: t('homepage.features.swish-slack-integration.title'),
        description: t('homepage.features.swish-slack-integration.description'),
        icon: Link2,
        accentClass: 'bg-primary/10',
      },
      {
        title: t('homepage.features.multi-language.title'),
        description: t('homepage.features.multi-language.description'),
        icon: Languages,
        accentClass: 'bg-primary/10',
      },
    ],
    [],
  )

  const FeatureCard = ({ feature }: { feature: Feature }) => {
    const Icon = feature.icon
    return (
      <Card className="border-0 transition-colors">
        <CardContent className="pt-6">
          <div
            className={`h-12 w-12 rounded-lg ${feature.accentClass} flex items-center justify-center mb-4`}
          >
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {feature.description}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen admin-styles">
      <header className="border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold flex">
              <Citrus className="h-6 w-6 mr-2" />
              KioskPOS
            </h1>
            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" onClick={toggleTheme}>
                {isLight ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
              <LanguageSwitcher />
              <Button variant="outline" size="sm" asChild>
                <Link
                  href="https://github.com/alexanderwassbjer/kiosk-pos"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="mx-auto text-center lg:text-left">
              <p className="mb-4 text-sm">{t('homepage.badge')}</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-6">
                {t('homepage.title')}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground text-balance mb-8 leading-relaxed">
                {t('homepage.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="text-base" asChild>
                  <Link
                    href="https://github.com/alexanderwassbjer/kiosk-pos"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    {t('homepage.get-started')}
                  </Link>
                </Button>
                <Button size="lg" className="text-base" asChild>
                  <Link href="/pos">
                    <Computer className="h-5 w-5 mr-2" />
                    {t('homepage.try-it-out')}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center mt-6 lg:mt-0">
              <Image
                src="/pos.png"
                alt="KioskPOS"
                width={0}
                height={0}
                className="w-full h-auto rounded-xl shadow-lg border-2"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t('homepage.features.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              {t('homepage.features.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      <section id="images" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center flex-row lg:flex-col gap-6">
            <Image
              src="/admin.png"
              alt="KioskPOS"
              width={0}
              height={0}
              className="w-auto max-h-[500px] rounded-xl shadow-lg border-2"
            />
          </div>
        </div>
      </section>

      <section id="get-started" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-2xl font-bold mb-4 text-balance">
              {t('homepage.get-started')}
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link
                  href="https://github.com/alexanderwassbjer/kiosk-pos"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-5 w-5 mr-2" />
                  {t('homepage.view-on-github')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-0 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold flex">
                <Citrus className="h-6 w-6 mr-2" />
                KioskPOS
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 KioskPOS. Open source under MIT License.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
