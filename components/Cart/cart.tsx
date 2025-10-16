'use client'

import type { CartItem } from '@/lib/types'
import { cn } from '@/lib/utils'

import { Nunito_Sans } from 'next/font/google'
import { CartProductItem } from './cart-product-item'
import { ConciergeBell } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from '@/hooks/use-translation'
import { memo } from 'react'

const nunito = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-nunito',
})

interface CartProps {
  items: CartItem[]
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
}

const Cart = memo(({ items, removeFromCart, updateQuantity }: CartProps) => {
  const { t } = useTranslation()

  return (
    <>
      {items.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 80,
            damping: 28,
            delay: 1,
            mass: 1.4,
          }}
          className="flex flex-col items-center justify-center h-full gap-2"
        >
          <motion.div
            animate={{
              x: [0, -2, 2, -2, 2, 0],
            }}
            transition={{
              duration: 0.4,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'easeInOut',
            }}
          >
            <ConciergeBell className="w-10 h-10 text-gray-400 dark:text-gray-500 mt-6" />
          </motion.div>
          <span
            className={cn(
              'text-md text-gray-400 dark:text-gray-500 font-medium',
              nunito.className,
            )}
          >
            {t('pos.cart.nothing-here-yet')}
          </span>
        </motion.div>
      )}
      <div
        className={cn(
          'max-h-[55vh] overflow-y-auto overflow-x-hidden space-y-2',
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 60, y: 0 }}
              animate={{
                opacity: 1,
                x: 0,
                transition: {
                  delay: 0.4,
                  duration: 0.8,
                },
              }}
              exit={{
                opacity: 0,
                x: 60,
                transition: {
                  delay: 0,
                  duration: 0.4,
                },
              }}
              transition={{
                type: 'spring',
                stiffness: 50,
                damping: 20,
                mass: 1.2,
              }}
              layout
            >
              <CartProductItem
                item={item}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
})

Cart.displayName = 'Cart'

export default Cart
