'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useCurrencyFormat } from '@/lib/currency'
import { Nunito_Sans } from 'next/font/google'
import { useTranslation } from '@/hooks/use-translation'
import { memo } from 'react'

const nunito = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-nunito',
})

type TotalsCardProps = {
  cartItemCount: number
  cartTotal: number
  onPlaceOrder: () => void
}

const TotalsCard = memo(
  ({ cartItemCount, cartTotal, onPlaceOrder }: TotalsCardProps) => {
    const currencyFormat = useCurrencyFormat()
    const { t } = useTranslation()

    if (cartItemCount === 0) {
      return null
    }

    return (
      <Card className="flex-1 dark:bg-pos-bgSecondary dark:border-pos-borderSecondary overflow-hidden">
        <CardContent className="p-6 h-full flex flex-col">
          <div className="space-y-6 overflow-auto flex-1">
            <div
              className={cn(
                'flex justify-between text-sm dark:text-white',
                nunito.className,
              )}
            >
              <span>{t('pos.number-of-items')}</span>
              <span>{currencyFormat(cartItemCount)}</span>
            </div>
            <div className="border-b border-dashed dark:border-white/50" />
            <div
              className={cn(
                'flex justify-between font-medium text-lg dark:text-white',
                nunito.className,
              )}
            >
              <span>{t('pos.total')}</span>
              <span>{currencyFormat(cartTotal)}</span>
            </div>
          </div>
          <button
            onClick={onPlaceOrder}
            className={cn(
              'w-full p-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-colors disabled:bg-green-200 disabled:text-black/40 disabled:cursor-not-allowed flex items-center justify-center mt-4',
              nunito.className,
            )}
          >
            {t('pos.place-order')}
          </button>
        </CardContent>
      </Card>
    )
  },
)

TotalsCard.displayName = 'TotalsCard'

export default TotalsCard
