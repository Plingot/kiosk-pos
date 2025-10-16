'use client'

import { Loader2, UserX } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import CustomerSelector from '@/components/Cart/customer-selector'
import type { Customer } from '@/lib/types'
import { useTranslation } from '@/hooks/use-translation'
import { memo, useCallback } from 'react'

type CheckoutDialogProps = {
  open: boolean
  onOpenChange: () => void
  selectedCustomer: string | null
  setSelectedCustomer: (id: string | null) => void
  onCustomerSelect: (customer: Customer | null) => void
  customers: Customer[]
  isGuestMode: boolean
  setIsGuestMode: (v: boolean) => void
  isProcessing: boolean
  onCheckout: () => Promise<void>
  onGuestCheckout: () => Promise<void>
  hasItems: boolean
  fontClass: string
}

const CheckoutDialog = memo(
  ({
    open,
    onOpenChange,
    selectedCustomer,
    setSelectedCustomer,
    onCustomerSelect,
    customers,
    isGuestMode,
    setIsGuestMode,
    isProcessing,
    onCheckout,
    onGuestCheckout,
    hasItems,
    fontClass,
  }: CheckoutDialogProps) => {
    const { t } = useTranslation()

    const RenderButton = useCallback(() => {
      if (!hasItems) {
        return null
      }

      const returnTitle = () => {
        if (isProcessing) {
          return t('pos.processing')
        }
        return isGuestMode ? t('pos.proceed-to-payment') : t('pos.place-order')
      }

      const className = cn(
        'w-full p-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-colors disabled:bg-green-200 disabled:text-black/40 disabled:cursor-not-allowed flex items-center justify-center mt-4',
        fontClass,
      )

      const disabled = isProcessing || (!isGuestMode && !selectedCustomer)
      const onClick = isGuestMode ? onGuestCheckout : onCheckout

      return (
        <button onClick={onClick} disabled={disabled} className={className}>
          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {returnTitle()}
        </button>
      )
    }, [
      hasItems,
      isProcessing,
      isGuestMode,
      selectedCustomer,
      onCheckout,
      onGuestCheckout,
      t,
      fontClass,
    ])

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[50vw]">
          <DialogHeader>
            <DialogTitle>{t('pos.customer-guest')}</DialogTitle>
          </DialogHeader>
          <CustomerSelector
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            onCustomerSelect={onCustomerSelect}
            disabled={isGuestMode}
            customers={customers}
          />

          {!selectedCustomer && process.env.NEXT_PUBLIC_PAYMENT_LINK && (
            <Button
              variant="default"
              className={cn(
                `w-full flex items-center active:scale-90 transition transform bg-gray-100 focus:bg-gray-100 hover:bg-gray-100 dark:hover:bg-pos-bg text-black dark:bg-pos-bg dark:focus:bg-pos-bg justify-center rounded-lg gap-2 ${
                  isGuestMode
                    ? '!bg-green-600 hover:!bg-green-700 text-white'
                    : 'text-black dark:text-white'
                }`,
                fontClass,
              )}
              onClick={() => setIsGuestMode(!isGuestMode)}
            >
              <UserX className="h-4 w-4 opacity-70" />
              {isGuestMode
                ? t('pos.guest-mode-active')
                : t('pos.guest-purchase')}
            </Button>
          )}

          {RenderButton()}
        </DialogContent>
      </Dialog>
    )
  },
)

CheckoutDialog.displayName = 'CheckoutDialog'

export default CheckoutDialog
