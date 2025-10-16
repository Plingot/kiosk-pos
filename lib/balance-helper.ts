import { useToast } from '@/components/ui/use-toast'
import { useCurrencyFormat } from './currency'
import {
  sendBalanceResetNotification,
  sendInvoiceNotification,
} from './notifications'
import { api } from './trpc'
import type { Customer } from './types'
import { useState } from 'react'
import { useTranslation } from '@/hooks/use-translation'

export const useHandleResetBalances = () => {
  const [isResetting, setIsResetting] = useState(false)
  const { mutateAsync: resetAllTransactionsToPaid } =
    api.transactions.resetAllTransactionsToPaid.useMutation()
  const utils = api.useUtils()
  const { toast } = useToast()
  const { t } = useTranslation()

  const mutate = async () => {
    try {
      setIsResetting(true)
      await resetAllTransactionsToPaid()

      toast({
        title: t('admin.balances.balances-reset'),
        description: t(
          'admin.balances.all-customer-balances-have-been-reset-to-0',
        ),
      })

      utils.transactions.getTransactions.refetch()
      utils.customers.getCustomers.refetch()
    } catch (error) {
      console.error('Error resetting balances:', error)
      toast({
        title: t('admin.balances.error'),
        description: t('admin.balances.error-reset-description'),
        variant: 'destructive',
      })
    } finally {
      setIsResetting(false)
    }
  }
  return { mutate, isResetting }
}

export const useHandleResetSingleCustomer = () => {
  const [isResetting, setIsResetting] = useState(false)
  const utils = api.useUtils()
  const { toast } = useToast()
  const currencyFormat = useCurrencyFormat()
  const { t } = useTranslation()
  const { mutateAsync: updateCustomerTransactionsPending } =
    api.transactions.updateCustomerTransactionsPending.useMutation()
  const { data: transactions } = api.transactions.getTransactions.useQuery()

  const mutate = async (customerToReset: Customer | null) => {
    if (!customerToReset) {
      return
    }

    await utils.transactions.getTransactions.refetch()

    setIsResetting(true)
    try {
      const allTransactions =
        transactions?.filter(
          (transaction) =>
            customerToReset.id === transaction.customerId &&
            !transaction.paid &&
            transaction.pending,
        ) || []

      const totalAmount = allTransactions.reduce((sum, transaction) => {
        return sum + transaction.total
      }, 0)

      await updateCustomerTransactionsPending({
        customerId: customerToReset.id,
      })

      toast({
        title: t('admin.balances.balance-reset'),
        description: t('admin.balances.balance-reset-description', {
          name: customerToReset.name,
        }),
      })

      await sendBalanceResetNotification(
        customerToReset,
        t,
        totalAmount,
        currencyFormat,
      )

      utils.transactions.getTransactions.refetch()
      utils.customers.getCustomers.refetch()
    } catch (error) {
      console.error('Error resetting balance:', error)
      toast({
        title: t('admin.balances.error'),
        description: t('admin.balances.error-reset-balance-description'),
        variant: 'destructive',
      })
    } finally {
      setIsResetting(false)
    }
  }

  return { mutate, isResetting }
}

export const useGenerateInvoice = () => {
  const { mutateAsync: setAllCustomerTransactionsToPending } =
    api.transactions.setAllCustomerTransactionsToPending.useMutation()
  const utils = api.useUtils()
  const { toast } = useToast()
  const currencyFormat = useCurrencyFormat()
  const { t } = useTranslation()
  const { data: transactions } = api.transactions.getTransactions.useQuery()

  const mutate = async (customer: Customer) => {
    await setAllCustomerTransactionsToPending({ customerId: customer.id })

    utils.transactions.getTransactions.refetch()
    utils.customers.getCustomers.refetch()

    const response = await sendInvoiceNotification(
      customer,
      t,
      transactions || [],
      currencyFormat,
    )

    if (!response.ok) {
      throw new Error(
        `Failed to send Slack notification: ${response.statusText}`,
      )
    } else {
      toast({
        title: t('admin.balances.sent'),
      })
    }
  }

  return { mutate }
}
