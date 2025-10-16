'use client'

import TransactionTab from '@/components/admin/transaction-tab'
import { useTranslation } from '@/hooks/use-translation'

export default function TransactionsPage() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {t('admin.transactions.title')}
      </h1>
      <TransactionTab />
    </div>
  )
}
