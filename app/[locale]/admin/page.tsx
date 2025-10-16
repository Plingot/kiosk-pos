'use client'
import DashboardTab from '@/components/admin/dashboard-tab'
import { useTranslation } from '@/hooks/use-translation'

export default function AdminPage() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('admin.dashboard.title')}</h1>
      <DashboardTab />
    </div>
  )
}
