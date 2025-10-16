'use client'

import BalanceTab from '@/components/admin/balance-tab'
import { useTranslation } from '@/hooks/use-translation'

export default function BalancePage() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('admin.balances.title')}</h1>
      <BalanceTab />
    </div>
  )
}
