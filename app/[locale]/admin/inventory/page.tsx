'use client'

import InventoryTab from '@/components/admin/inventory-tab'
import { useTranslation } from '@/hooks/use-translation'

export default function InventoryPage() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('admin.inventory.title')}</h1>
      <InventoryTab />
    </div>
  )
}
