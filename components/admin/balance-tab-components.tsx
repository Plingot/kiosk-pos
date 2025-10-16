import { useTranslation } from '@/hooks/use-translation'
import { useCurrencyFormat } from '@/lib/currency'
import type { Customer } from '@/lib/types'
import { TableCell, TableRow } from '../ui/table'
import { Coins } from 'lucide-react'
import { Button } from '../ui/button'
import { api } from '@/lib/trpc'

const CustomerBalancePending = ({
  customer,
  openResetSingleDialog,
}: {
  customer: Customer
  openResetSingleDialog: (customer: Customer) => void
}) => {
  const currencyFormat = useCurrencyFormat()
  const { t } = useTranslation()

  const { data: balance } =
    api.balances.calculateCustomerBalancePending.useQuery({
      customerId: customer.id,
    })

  if (balance === 0) {
    return null
  }

  return (
    <TableRow
      key={customer.id + '-pending'}
      className="bg-slate-50 dark:bg-gray-800"
    >
      <TableCell />
      <TableCell>{t('admin.balances.outstanding-invoice')}</TableCell>
      <TableCell />
      <TableCell className="text-right font-medium text-green-700 dark:text-green-400">
        {currencyFormat(balance)}
      </TableCell>
      <TableCell>
        {balance && balance > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-green-700 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-400 dark:hover:bg-green-950"
            onClick={() => openResetSingleDialog(customer)}
          >
            <Coins className="h-3.5 w-3.5 mr-1" />
            {t('admin.balances.mark-as-paid')}
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}

CustomerBalancePending.displayName = 'CustomerBalancePending'

export default CustomerBalancePending
