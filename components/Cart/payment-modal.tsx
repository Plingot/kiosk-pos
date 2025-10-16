'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useMemo } from 'react'
import Image from 'next/image'
import { Nunito_Sans } from 'next/font/google'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'
import { useCurrencyFormat } from '@/lib/currency'

const nunito = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-nunito',
})

interface PaymentModalProps {
  isOpen: boolean
  onSuccess: () => void
  onCancel: () => void
  amount: number
}

function PaymentModal({
  isOpen,
  onSuccess,
  onCancel,
  amount,
}: PaymentModalProps) {
  const currencyFormat = useCurrencyFormat()
  const { t } = useTranslation()

  const getQrCodeUrl = useMemo(() => {
    if (!amount || !isOpen) {
      return ''
    }
    const tempPaymentLink = process.env.NEXT_PUBLIC_PAYMENT_LINK
    const paymentLink =
      tempPaymentLink?.replace('{AMOUNT}', amount.toFixed(2)) ?? ''
    const encodedPaymentUrl = encodeURIComponent(paymentLink)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedPaymentUrl}&size=200x200`
    return qrUrl
  }, [amount, isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {t('pos.payment-modal.pay-direct')}
          </DialogTitle>
        </DialogHeader>
        <div
          className={cn(
            'flex flex-col items-center justify-center p-4 space-y-6',
            nunito.className,
          )}
        >
          <p className="text-center text-gray-600 dark:text-gray-200">
            {t('pos.payment-modal.scan-qr-code')} {currencyFormat(amount)}
          </p>

          <div className="rounded-md flex items-center justify-center w-[150px] h-[50px] bg-white">
            <Image
              // TODO: Change to dynamic
              src="/swish.png"
              alt="Payment Logo"
              width={100}
              height={50}
              className="object-contain"
            />
          </div>

          {getQrCodeUrl && (
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <img
                src={getQrCodeUrl || '/placeholder.svg'}
                alt="Swish QR"
                className="w-[200px] h-[200px]"
              />
            </div>
          )}

          <p className="text-sm text-gray-500 text-center dark:text-gray-200">
            {t('pos.payment-modal.click-to-pay')}
          </p>

          <Button
            onClick={onSuccess}
            className="w-full py-6 px-6 rounded-full dark:bg-pos-bg dark:focus:bg-pos-bg text-white"
          >
            {t('pos.payment-modal.i-have-paid')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

PaymentModal.displayName = 'PaymentModal'

export default PaymentModal
