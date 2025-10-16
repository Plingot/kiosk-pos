'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import Flag from 'react-flagpack'
import { memo } from 'react'

const LanguageSwitcher = memo(({ className }: { className?: string }) => {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  // https://flagpack.xyz/docs/flag-index/
  const locales = [
    { code: 'en', flag: 'US', label: 'English' },
    { code: 'sv', flag: 'SE', label: 'Svenska' },
  ]

  const handleChange = (newLocale: string) => {
    const newPathname = pathname.replace(/^\/[a-z]{2}/, `/${newLocale}`)
    router.push(newPathname)
  }

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className={cn(className)}>
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {locales.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            <div className="flex items-center gap-2">
              <div className="rounded-md overflow-hidden">
                <Flag code={l.flag} size="m" />
              </div>
              {l.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
})

LanguageSwitcher.displayName = 'LanguageSwitcher'

export { LanguageSwitcher }
