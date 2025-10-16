'use client'

import RequestTab from '@/components/admin/request-tab'
import { useTranslation } from '@/hooks/use-translation'

export default function RequestsPage() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('admin.requests.title')}</h1>
      <RequestTab />
    </div>
  )
}
