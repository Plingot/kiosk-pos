import { cn } from '@/lib/utils'
import { type CartItem } from '@/lib/types'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { memo, useCallback, useEffect, useState } from 'react'
import { Nunito_Sans } from 'next/font/google'
import { motion, useAnimation } from 'framer-motion'
import { useCurrencyFormat } from '@/lib/currency'
import { useTranslation } from '@/hooks/use-translation'

const nunito = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-nunito',
})

const CartProductItem = memo(
  ({
    item,
    updateQuantity,
    removeFromCart,
  }: {
    item: CartItem
    updateQuantity: (id: string, quantity: number) => void
    removeFromCart: (id: string) => void
  }) => {
    const [showActions, setShowActions] = useState(false)
    const pulseControls = useAnimation()
    const currencyFormat = useCurrencyFormat()
    const { t } = useTranslation()

    useEffect(() => {
      if (!showActions) {
        return
      }

      let timer = setTimeout(() => {
        setShowActions(false)
      }, 3000)

      return () => clearTimeout(timer)
    }, [showActions, item.quantity])

    useEffect(() => {
      pulseControls.start({
        scale: [1, 0.94, 1],
        transition: { duration: 0.18, ease: 'easeOut' },
      })
    }, [item.quantity, pulseControls])

    const updateQuantityHandler = useCallback(
      (type: 'increment' | 'decrement') => {
        updateQuantity(
          item.id,
          type === 'increment' ? item.quantity + 1 : item.quantity - 1,
        )
      },
      [item.id, item.quantity, updateQuantity],
    )

    return (
      <motion.div
        key={item.id}
        className="relative flex items-center justify-between bg-white dark:bg-pos-bgSecondary dark:border-pos-borderSecondary border rounded-lg select-none"
        onClick={() => setShowActions((v) => !v)}
        animate={pulseControls}
        initial={false}
      >
        <div
          className={cn(
            'flex items-center transition-transform duration-200 p-4 ease-in-out',
            showActions ? 'translate-x-14' : 'translate-x-0',
          )}
        >
          <div
            className={cn(
              'relative h-12 w-12 rounded-md overflow-hidden bg-muted transition-all duration-100 ease-in-out bg-gray-100 dark:bg-gray-100',
              showActions ? 'w-0' : 'h-12 w-12',
            )}
          >
            <Image
              src={item.image || '/placeholder.svg'}
              alt={item.name}
              fill
              className={cn('object-contain')}
            />
          </div>
          <div className="ml-3">
            <h4 className={cn('font-medium dark:text-white', nunito.className)}>
              {item.name}
              {!showActions && (
                <span
                  className={cn(
                    'font-normal text-muted-foreground ml-1',
                    nunito.className,
                  )}
                >
                  x{item.quantity}
                </span>
              )}
            </h4>
            <p className="text-sm text-muted-foreground dark:text-slate-400">
              {item.variant && (
                <span
                  className={cn(
                    'text-sm font-normal text-muted-foreground',
                    showActions ? 'hidden' : '',
                  )}
                >
                  ({item.variant.name})
                </span>
              )}{' '}
              {currencyFormat(item.price)} {t('pos.cart.per-pc')}
            </p>
          </div>
        </div>

        <div
          className={cn(
            'flex items-center space-x-2 transition-opacity duration-150 mr-4',
            showActions ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 rounded-md border dark:border-slate-100 dark:focus:bg-pos-bg',
                nunito.className,
                item.quantity === 1 && '!opacity-20',
              )}
              disabled={item.quantity === 1}
              onClick={(e) => {
                e.stopPropagation()
                updateQuantityHandler('decrement')
              }}
            >
              <Minus className="h-4 w-4 dark:text-slate-100" />
            </Button>
            <span
              className={cn(
                'w-8 text-center dark:text-white',
                nunito.className,
              )}
            >
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 rounded-md border dark:border-slate-100 dark:focus:bg-pos-bg',
                nunito.className,
              )}
              onClick={(e) => {
                e.stopPropagation()
                updateQuantityHandler('increment')
              }}
            >
              <Plus className="h-4 w-4 dark:text-slate-100" />
            </Button>
          </div>
        </div>
        <div
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 pr-2 h-full flex justify-center items-center transition-opacity rounded-l-lg dark:bg-[#212325] duration-150',
            showActions ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-16 w-16 text-red-500 hover:text-red-600 hover:bg-transparent focus:bg-transparent"
            onClick={() => removeFromCart(item.id)}
          >
            <Trash2 className="!h-5 !w-5" />
          </Button>
        </div>
        <div
          className={cn(
            'absolute left-[64px] top-0 bottom-0 h-full w-[15px] transition-opacity rounded-l-lg duration-150 bg-white dark:bg-pos-bgSecondary',
            showActions ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
          onClick={(e) => e.stopPropagation()}
        />
      </motion.div>
    )
  },
)

CartProductItem.displayName = 'CartProductItem'

export { CartProductItem }
