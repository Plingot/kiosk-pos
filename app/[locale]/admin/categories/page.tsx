'use client'

import { useTranslation } from '@/hooks/use-translation'
import CategoryTab from '@/components/admin/category-tab'

export default function CategoriesPage() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('admin.categories.title')}</h1>
      <CategoryTab />
    </div>
  )
}
