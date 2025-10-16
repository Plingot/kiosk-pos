'use client'

import { useState, Fragment, useCallback, useMemo } from 'react'
import { Search, RefreshCw, Coins, ReceiptText } from 'lucide-react'
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
import Avatar from 'boring-avatars'
import type { Customer } from '@/lib/types'
import { useCurrencyFormat } from '@/lib/currency'
import { DeleteDialog } from './delete-dialog'
import { useTranslation } from '@/hooks/use-translation'
import { api } from '@/lib/trpc'
import CustomerBalancePending from './balance-tab-components'
import IsLoadingPage from './loading'
import {
  useGenerateInvoice,
  useHandleResetBalances,
  useHandleResetSingleCustomer,
} from '@/lib/balance-helper'

function BalanceTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isResetSingleDialogOpen, setIsResetSingleDialogOpen] = useState(false)
  const [customerToReset, setCustomerToReset] = useState<Customer | null>(null)
  const currencyFormat = useCurrencyFormat()
  const { t } = useTranslation()

  const { isLoading: isLoadingTransactions } =
    api.transactions.getTransactions.useQuery()
  const { data: customersData, isLoading: isLoadingCustomers } =
    api.customers.getCustomers.useQuery()

  const { mutate: handleResetBalances, isResetting: isResettingBalances } =
    useHandleResetBalances()
  const { mutate: handleResetSingleCustomer, isResetting: isResettingSingle } =
    useHandleResetSingleCustomer()
  const { mutate: generateInvoice } = useGenerateInvoice()

  const isResetting = isResettingBalances || isResettingSingle

  const isLoading = isLoadingTransactions || isLoadingCustomers

  const customers = useMemo(
    () => customersData?.sort((a, b) => b.balance - a.balance) || [],
    [customersData],
  )

  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (customer.email &&
            customer.email.toLowerCase().includes(searchTerm.toLowerCase())),
      ),
    [customers, searchTerm],
  )

  const totalBalance = useMemo(
    () =>
      filteredCustomers.reduce((sum, customer) => sum + customer.balance, 0),
    [filteredCustomers],
  )

  const openResetSingleDialog = useCallback(
    (customer: Customer) => {
      setCustomerToReset(customer)
      setIsResetSingleDialogOpen(true)
    },
    [setCustomerToReset, setIsResetSingleDialogOpen],
  )

  const generateAllInvoices = useCallback(async () => {
    for (const customer of filteredCustomers) {
      await generateInvoice(customer)
    }
  }, [filteredCustomers])

  const resetBalances = async () => {
    await handleResetBalances()
    setIsResetDialogOpen(false)
  }

  const resetSingleBalance = async () => {
    await handleResetSingleCustomer(customerToReset)
    setIsResetSingleDialogOpen(false)
    setCustomerToReset(null)
  }

  if (isLoading) {
    return (
      <IsLoadingPage string={t('admin.balances.loading-customer-balances')} />
    )
  }

  return (
    <div>
      <div className="mt-8 mb-6 flex justify-between gap-4">
        <div className="text-lg font-medium">
          {t('admin.balances.total-balance')}:{' '}
          <span className="text-primary">{currencyFormat(totalBalance)}</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-sky-300 text-sky-600 hover:bg-sky-50 hover:text-sky-700 dark:border-sky-400 dark:text-sky-400 dark:hover:bg-sky-950 dark:hover:text-white"
            onClick={generateAllInvoices}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('admin.balances.send-all-invoices')}
          </Button>
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-white"
            onClick={() => setIsResetDialogOpen(true)}
          >
            <Coins className="mr-2 h-4 w-4" />
            {t('admin.balances.mark-all-as-paid')}
          </Button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t('admin.balances.search-customers')}
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">
              {t('admin.balances.no-customers-found')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]"></TableHead>
                <TableHead>{t('admin.balances.name')}</TableHead>
                <TableHead>{t('admin.balances.email')}</TableHead>
                <TableHead className="text-right">
                  {t('admin.balances.balance')}
                </TableHead>
                <TableHead className="w-[100px]">
                  {t('admin.balances.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <Fragment key={customer.id}>
                  <TableRow>
                    <TableCell>
                      <Avatar
                        size={40}
                        name={customer.name}
                        variant="beam"
                        colors={[
                          '#92A1C6',
                          '#146A7C',
                          '#F0AB3D',
                          '#C271B4',
                          '#C20D90',
                        ]}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell className="text-right font-medium">
                      {currencyFormat(customer.balance)}
                    </TableCell>
                    <TableCell className="gap-2 flex flex-col items-center">
                      {customer.balance > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sky-600 border-sky-200 hover:bg-sky-50 dark:text-sky-400 dark:border-sky-400 dark:hover:bg-sky-950"
                          onClick={() => generateInvoice(customer)}
                        >
                          <ReceiptText className="h-3.5 w-3.5 mr-1" />
                          {t('admin.balances.send-invoice')}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  <CustomerBalancePending
                    customer={customer}
                    openResetSingleDialog={openResetSingleDialog}
                  />
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DeleteDialog
        deleteConfirmOpen={isResetDialogOpen}
        setDeleteConfirmOpen={setIsResetDialogOpen}
        handleDeleteConfirm={resetBalances}
        customDescription={t(
          'admin.balances.this-action-cannot-be-undone-all-customer-balances-will-be-reset-to-0',
        )}
        isLoading={isResetting}
        customConfirmButtonText={t('admin.balances.reset-all')}
      />

      <DeleteDialog
        deleteConfirmOpen={isResetSingleDialogOpen}
        setDeleteConfirmOpen={setIsResetSingleDialogOpen}
        handleDeleteConfirm={resetSingleBalance}
        customDescription={t(
          'admin.balances.this-action-cannot-be-undone-the-customer-s-balance-will-be-reset-to-0',
        )}
        isLoading={isResetting}
        customConfirmButtonText={t('admin.balances.reset')}
      />
    </div>
  )
}

BalanceTab.displayName = 'BalanceTab'

export default BalanceTab
