'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
} from 'chart.js'
import { useTranslation } from '@/hooks/use-translation'
import { api } from '@/lib/trpc'
import {
  DashboardStatisticsCards,
  DashboardStatisticsChart,
  DashboardStatisticsLatestTransactions,
} from './dashboard-statistics'
import { prepareChartData } from '@/lib/prepare-chart-data'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export type StatsType = {
  totalRevenue: number
  weeklyRevenue: number
  customerCount: number
  productCount: number
  transactionCount: number
}

export type ChartDataType = ChartData<
  'bar',
  (number | [number, number] | null)[],
  unknown
>

function DashboardTab() {
  const [stats, setStats] = useState<StatsType>({
    totalRevenue: 0,
    weeklyRevenue: 0,
    customerCount: 0,
    productCount: 0,
    transactionCount: 0,
  })
  const [chartData, setChartData] = useState<ChartDataType | null>(null)
  const { toast } = useToast()
  const { t } = useTranslation()
  const { data: products, isLoading: isLoadingProducts } =
    api.products.getProducts.useQuery()
  const { data: transactions, isLoading: isLoadingTransactions } =
    api.transactions.getTransactions.useQuery()
  const { data: customers, isLoading: isLoadingCustomers } =
    api.customers.getCustomers.useQuery()

  const isLoading =
    isLoadingProducts || isLoadingTransactions || isLoadingCustomers

  useEffect(() => {
    async function loadData() {
      try {
        const totalRevenue = transactions?.reduce((sum, t) => sum + t.total, 0)

        const now = new Date()
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const recentTransactions = transactions?.filter(
          (t) => t.timestamp >= oneWeekAgo,
        )
        const weeklyRevenue = recentTransactions?.reduce(
          (sum, t) => sum + t.total,
          0,
        )

        setStats({
          totalRevenue: totalRevenue || 0,
          weeklyRevenue: weeklyRevenue || 0,
          customerCount: customers?.length || 0,
          productCount: products?.length || 0,
          transactionCount: transactions?.length || 0,
        })

        const tempData = prepareChartData(transactions || [], t)
        setChartData(tempData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: t('admin.dashboard.error'),
          description: t('admin.dashboard.could-not-load-dashboard-data'),
          variant: 'destructive',
        })
      }
    }

    if (products && transactions && customers) {
      loadData()
    }
  }, [products, transactions, customers])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">
          {t('admin.dashboard.loading-dashboard')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardStatisticsCards stats={stats} isLoading={isLoading} />

      <DashboardStatisticsChart chartData={chartData} />

      <DashboardStatisticsLatestTransactions
        transactions={transactions || []}
      />
    </div>
  )
}

DashboardTab.displayName = 'DashboardTab'

export default DashboardTab
