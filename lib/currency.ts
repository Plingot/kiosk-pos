'use client'

import { useFormatter } from 'next-intl'

export const useCurrencyFormat = () => {
  const format = useFormatter()

  return (amount?: number | null) => {
    if (amount == null) {
      return '-'
    }

    return format.number(amount, {
      style: 'currency',
      currency: process.env.NEXT_PUBLIC_CURRENCY || 'USD',
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 0,
    })
  }
}
