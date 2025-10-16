'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  Search,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  HandCoins,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Transaction } from '@/lib/types'
import TransactionForm from './transaction-form'
import { useSearchParams } from 'next/navigation'
import { formatDate } from '@/lib/format-date'
import { useCurrencyFormat } from '@/lib/currency'
import { useTranslation } from '@/hooks/use-translation'
import { api } from '@/lib/trpc'

function TransactionTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null)
  const searchParams = useSearchParams()
  const productId = searchParams.get('productId')
  const variantId = searchParams.get('variantId')
  const currencyFormat = useCurrencyFormat()
  const { t } = useTranslation()

  const utils = api.useUtils()

  const { data: transactions, isLoading } =
    api.transactions.getTransactions.useQuery()

  const filteredTransactions = useMemo(
    () =>
      transactions?.filter((transaction) => {
        const matchesProduct = productId
          ? transaction.items.some((item) => item.productId === productId)
          : true

        const matchesVariant = variantId
          ? transaction.items.some((item) => item.variant?.id === variantId)
          : true

        const matchesSearch =
          searchTerm &&
          (transaction.customerName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
            transaction.id.toLowerCase().includes(searchTerm.toLowerCase()))

        return (
          matchesProduct && matchesVariant && (!searchTerm || matchesSearch)
        )
      }),
    [transactions, productId, variantId, searchTerm],
  )

  const handleViewTransaction = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction)
  }, [])

  const returnIconForStatus = (transaction: Transaction) => {
    if (transaction.paid) {
      return <CheckCircle className="h-5 w-5 text-green-800" />
    } else if (transaction.pending) {
      return <HandCoins className="h-5 w-5 text-yellow-800" />
    } else {
      return <XCircle className="h-5 w-5 text-red-800" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">
          {t('admin.transactions.loading-transactions')}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="relative mb-6 mt-8">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t(
            'admin.transactions.search-for-customer-or-transaction-id',
          )}
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredTransactions?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">
              {t('admin.transactions.no-transactions-found')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.transactions.date')}</TableHead>
                <TableHead>{t('admin.transactions.customer')}</TableHead>
                <TableHead>{t('admin.transactions.number-of-items')}</TableHead>
                <TableHead>{t('admin.transactions.paid-status')}</TableHead>
                <TableHead>{t('admin.transactions.total')}</TableHead>
                <TableHead className="text-right">
                  {t('admin.transactions.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions?.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="cursor-pointer"
                  onClick={() => handleViewTransaction(transaction)}
                >
                  <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                  <TableCell className="font-medium">
                    {transaction.customerName}
                  </TableCell>
                  <TableCell>
                    {transaction.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0,
                    )}{' '}
                    {t('admin.transactions.pc')}
                  </TableCell>
                  <TableCell>{returnIconForStatus(transaction)}</TableCell>
                  <TableCell>{currencyFormat(transaction.total)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleViewTransaction(transaction)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedTransaction && (
        <TransactionForm
          transaction={selectedTransaction}
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          refreshTransactions={utils.transactions.getTransactions.refetch}
          setSelectedTransaction={handleViewTransaction}
        />
      )}
    </div>
  )
}

TransactionTab.displayName = 'TransactionTab'

export default TransactionTab
