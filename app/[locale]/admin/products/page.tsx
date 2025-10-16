'use client'

import { useTranslation } from '@/hooks/use-translation'
import ProductTab from '@/components/admin/product-tab'

export default function ProductsPage() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('admin.products.title')}</h1>
      <ProductTab />
    </div>
  )
}
