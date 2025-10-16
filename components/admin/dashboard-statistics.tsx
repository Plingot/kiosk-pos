import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Loader2,
  TrendingUp,
  Users,
  ShoppingBag,
  CreditCard,
} from 'lucide-react'
import type { Transaction } from '@/lib/types'
import { Bar } from 'react-chartjs-2'
import { useCurrencyFormat } from '@/lib/currency'
import { formatDate } from '@/lib/format-date'
import { useTranslation } from '@/hooks/use-translation'
import type { ChartDataType, StatsType } from './dashboard-tab'

export const DashboardStatisticsCards = memo(
  ({ stats, isLoading }: { stats: StatsType; isLoading: boolean }) => {
    const { t } = useTranslation()
    const currencyFormat = useCurrencyFormat()

    if (isLoading) {
      return <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.dashboard.total-sales')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencyFormat(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('admin.dashboard.total-since-start')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.dashboard.sales-last-7-days')}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencyFormat(stats.weeklyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('admin.dashboard.last-7-days')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.dashboard.customers')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customerCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.dashboard.total-number-of-customers')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.dashboard.products')}
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.dashboard.total-number-of-products')}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  },
)

DashboardStatisticsCards.displayName = 'DashboardStatisticsCards'

export const DashboardStatisticsChart = memo(
  ({ chartData }: { chartData: ChartDataType | null }) => {
    const { t } = useTranslation()

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            {t('admin.dashboard.sales-last-7-days')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {chartData ? (
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: t('admin.dashboard.sales-last-7-days'),
                      },
                    },
                    x: {
                      title: {
                        display: true,
                        text: t('admin.dashboard.day'),
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  {t('admin.dashboard.no-sales-data-available')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  },
)

DashboardStatisticsChart.displayName = 'DashboardStatisticsChart'

export const DashboardStatisticsLatestTransactions = memo(
  ({ transactions }: { transactions: Transaction[] }) => {
    const { t } = useTranslation()
    const currencyFormat = useCurrencyFormat()

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            {t('admin.dashboard.latest-transactions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions?.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {t('admin.dashboard.no-transactions-found')}
            </p>
          ) : (
            <div className="space-y-4">
              {transactions?.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{transaction.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction.timestamp)}{' '}
                      {formatDate(transaction.timestamp, 'HH:mm')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {currencyFormat(transaction.total)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      )}{' '}
                      {t('admin.dashboard.items')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  },
)
