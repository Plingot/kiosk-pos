import { useTranslations as useTranslationsNextIntl } from 'next-intl'

export const useTranslation = () => {
  const t = useTranslationsNextIntl()
  return { t }
}
