import type { ChartDataType } from '@/components/admin/dashboard-tab'
import type { Transaction } from './types'
import type { useTranslation } from '@/hooks/use-translation'

export const prepareChartData = (
  transactions: Transaction[],
  t: ReturnType<typeof useTranslation>['t'],
) => {
  const now = new Date()
  const days = []
  const dayLabels = [
    t('admin.dashboard.monday'),
    t('admin.dashboard.tuesday'),
    t('admin.dashboard.wednesday'),
    t('admin.dashboard.thursday'),
    t('admin.dashboard.friday'),
    t('admin.dashboard.saturday'),
    t('admin.dashboard.sunday'),
  ]

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(now.getDate() - i)
    date.setHours(0, 0, 0, 0)
    days.push(date)
  }

  const dailyRevenue = days.map((day) => {
    const nextDay = new Date(day)
    nextDay.setDate(day.getDate() + 1)

    const dayTransactions = transactions.filter(
      (t) => t.timestamp >= day && t.timestamp < nextDay,
    )

    return {
      date: day,
      dayOfWeek: dayLabels[day.getDay() === 0 ? 6 : day.getDay() - 1],
      revenue: dayTransactions.reduce((sum, t) => sum + t.total, 0),
    }
  })

  const data = {
    labels: dailyRevenue.map(
      (d) => `${d.dayOfWeek} ${d.date.getDate()}/${d.date.getMonth() + 1}`,
    ),
    datasets: [
      {
        label: t('admin.dashboard.daily-sales'),
        data: dailyRevenue.map((d) => d.revenue),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  }

  return data as ChartDataType
}
