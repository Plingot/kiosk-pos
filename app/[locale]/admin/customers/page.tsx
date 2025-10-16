'use client'

import CustomerTab from '@/components/admin/customer-tab'
import { useTranslation } from '@/hooks/use-translation'

export default function CustomersPage() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('admin.customers.title')}</h1>
      <CustomerTab />
    </div>
  )
}
