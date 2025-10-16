'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Image from 'next/image'
import type { Transaction } from '@/lib/types'
import { useCallback, useState } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { useToast } from '../ui/use-toast'
import { CheckCircle, XCircle } from 'lucide-react'
import { formatDate } from '@/lib/format-date'
import { useCurrencyFormat } from '@/lib/currency'
import { useTranslation } from '@/hooks/use-translation'
import { api } from '@/lib/trpc'

interface TransactionFormProps {
  transaction: Transaction
  isOpen: boolean
  onClose: () => void
  refreshTransactions: () => void
  setSelectedTransaction: (transaction: Transaction) => void
}

function TransactionForm({
  transaction,
  isOpen,
  onClose,
  refreshTransactions,
  setSelectedTransaction,
}: TransactionFormProps) {
  const [isEditTotalDialogOpen, setIsEditTotalDialogOpen] = useState(false)
  const [newTotalPrice, setNewTotalPrice] = useState(transaction.total)
  const { t } = useTranslation()

  const { toast } = useToast()
  const currencyFormat = useCurrencyFormat()

  const { mutateAsync: updateTransaction } =
    api.transactions.updateTransaction.useMutation()

  const updateTransactionTotal = useCallback(async () => {
    await updateTransaction({
      transaction: {
        id: transaction.id,
        customerId: transaction.customerId,
        customerName: transaction.customerName,
        items: transaction.items,
        timestamp: transaction.timestamp,
        total: newTotalPrice,
        paid: transaction.paid,
        pending: transaction.pending,
      },
    })
    setIsEditTotalDialogOpen(false)
    refreshTransactions()
    setSelectedTransaction({ ...transaction, total: newTotalPrice })
    toast({
      title: t('admin.transactions.total-price-updated'),
      description: t('admin.transactions.total-price-has-been-updated'),
    })
  }, [transaction, newTotalPrice, t])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] dark:bg-background">
        <DialogHeader>
          <DialogTitle>
            {t('admin.transactions.transaction-details')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {t('admin.transactions.transaction-id')}
              </p>
              <p className="font-mono text-xs">{transaction.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t('admin.transactions.date')}
              </p>
              <p>{formatDate(transaction.timestamp)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t('admin.transactions.paid-status')}
              </p>
              <p>
                {transaction.paid ? (
                  <CheckCircle className="h-6 w-6 text-green-800" />
                ) : transaction.pending ? (
                  t('admin.transactions.invoice-sent')
                ) : (
                  <XCircle className="h-6 w-6 text-red-800" />
                )}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              {t('admin.transactions.customer')}
            </p>
            <p className="font-medium">{transaction.customerName}</p>
            <p className="text-xs text-muted-foreground">
              ID: {transaction.customerId}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">
              {t('admin.transactions.products')}
            </p>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]"></TableHead>
                    <TableHead>{t('admin.transactions.product')}</TableHead>
                    <TableHead className="text-right">
                      {t('admin.transactions.price')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('admin.transactions.quantity')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('admin.transactions.total')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaction.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="relative h-8 w-8 rounded-md overflow-hidden bg-muted">
                          <Image
                            src={item.image || '/placeholder.svg'}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.name}
                        {item.variant && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({item.variant.name})
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {currencyFormat(item.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {currencyFormat(item.price * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <span className="font-medium">{t('admin.transactions.total')}</span>
            <span className="font-bold text-lg">
              {currencyFormat(transaction.total)}
            </span>
          </div>
          {isEditTotalDialogOpen && (
            <div className="flex justify-between items-end pt-4 border-t gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="transaction-price-new">
                  {t('admin.transactions.new-total-price')}
                </Label>
                <Input
                  id="transaction-price-new"
                  type="number"
                  min="0"
                  value={newTotalPrice.toString()}
                  onChange={(e) => setNewTotalPrice(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <Button
                size="sm"
                className="text-white bg-red-500 border-red-200 hover:bg-red-600"
                onClick={updateTransactionTotal}
              >
                {t('admin.transactions.save')}
              </Button>
            </div>
          )}
          {!transaction.pending && !transaction.paid && (
            <Button
              variant="outline"
              onClick={() => {
                setIsEditTotalDialogOpen(!isEditTotalDialogOpen)
              }}
            >
              {isEditTotalDialogOpen
                ? t('admin.transactions.cancel')
                : t('admin.transactions.change-total-price')}
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>{t('admin.transactions.close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

TransactionForm.displayName = 'TransactionForm'

export default TransactionForm
