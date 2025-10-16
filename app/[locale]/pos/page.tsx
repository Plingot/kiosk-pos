'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useToast } from '@/components/ui/use-toast'
import ProductList from '@/components/Products/product-list'
import Cart from '@/components/Cart/cart'

import PaymentModal from '@/components/Cart/payment-modal'
import type { Product, CartItem, Customer } from '@/lib/types'

import { Nunito_Sans } from 'next/font/google'
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion'
import TotalsCard from '@/components/Checkout/totals-card'
import CheckoutDialog from '@/components/Checkout/checkout-dialog'
import {
  computeCartTotal,
  findExistingCartItemIndex,
  buildCartItem,
} from '@/lib/pos-utils'
import { ScreensaverWrapper } from '@/components/screensaver'
import { useTranslation } from '@/hooks/use-translation'
import { sendOrderNotification } from '@/lib/notifications'
import { useCurrencyFormat } from '@/lib/currency'
import { api } from '@/lib/trpc'

const nunito = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-nunito',
})

function POS() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [selectedCustomerData, setSelectedCustomerData] =
    useState<Customer | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const { toast } = useToast()
  const [isGuestMode, setIsGuestMode] = useState(false)
  const [showSelectCustomer, setShowSelectCustomer] = useState(false)

  const utils = api.useUtils()
  const { t } = useTranslation()
  const currencyFormat = useCurrencyFormat()
  const { data: products } = api.products.getProducts.useQuery()
  const { data: customersData } = api.customers.getCustomers.useQuery()
  const { mutateAsync: processPayment } =
    api.purchase.processPayment.useMutation()
  const { mutateAsync: processGuestPayment } =
    api.purchase.processGuestPayment.useMutation()

  const customers = customersData?.sort((a, b) => b.balance - a.balance)

  const productListRef = useRef<{ resetCategoryFilter: () => void } | null>(
    null,
  )

  const resetInactivityTimer = useCallback(() => {
    inactivityTimerRef.current = null
  }, [inactivityTimerRef])

  const addToCart = useCallback(
    (product: Product, variantId?: string) => {
      resetInactivityTimer()
      const selectedVariant = variantId
        ? product.variants?.find((v) => v.id === variantId)
        : undefined
      const price = selectedVariant ? selectedVariant.price : product.price
      const variantName = selectedVariant ? selectedVariant.name : undefined
      const cartItemId = uuidv4()

      setCartItems((prev) => {
        const existingIndex = findExistingCartItemIndex(
          prev,
          product.id,
          variantId,
        )
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
          }
          return updated
        }
        const newItem: CartItem = buildCartItem(
          cartItemId,
          product,
          price,
          variantId,
          variantName,
        )
        return [...prev, newItem]
      })
    },
    [resetInactivityTimer],
  )

  const removeFromCart = useCallback(
    (itemId: string) => {
      resetInactivityTimer()
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId),
      )
    },
    [resetInactivityTimer],
  )

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      resetInactivityTimer()
      if (quantity <= 0) {
        removeFromCart(itemId)
        return
      }
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item,
        ),
      )
    },
    [removeFromCart, resetInactivityTimer],
  )

  const handleCustomerSelect = useCallback(
    (customer: Customer | null) => {
      resetInactivityTimer()
      setSelectedCustomerData(customer)
      setIsGuestMode(false)
    },
    [resetInactivityTimer],
  )

  const cartTotal = useMemo(() => computeCartTotal(cartItems), [cartItems])

  const isCartEmpty = cartItems.length === 0
  const handleDialogClose = useCallback(() => {
    setShowSelectCustomer(false)
    setIsGuestMode(false)
    setSelectedCustomer(null)
  }, [])

  const handleCheckout = async () => {
    resetInactivityTimer()
    if (!selectedCustomer || !selectedCustomerData || cartItems.length === 0) {
      return
    }

    setIsProcessing(true)

    const paymentFailedToast = () =>
      toast({
        title: t('pos.payment-failed'),
        description: t('pos.payment-failed-description'),
        variant: 'destructive',
      })

    try {
      const success = await processPayment({
        customerId: selectedCustomer,
        customerName: selectedCustomerData.name,
        items: cartItems,
        total: cartTotal,
      })

      if (success) {
        await sendOrderNotification(
          {
            name: selectedCustomerData.name,
            email: selectedCustomerData.email,
            items: cartItems,
            total: cartTotal,
            newBalance: selectedCustomerData.balance + cartTotal,
          },
          t,
          currencyFormat,
        )

        toast({
          title: t('pos.payment-successful'),
          description: t('pos.purchase-registered', {
            name: selectedCustomerData.name,
          }),
          variant: 'success',
        })

        utils.products.getProducts.refetch()
        utils.customers.getCustomers.refetch()
        utils.categories.getCategories.refetch()

        setCartItems([])
        setSelectedCustomer(null)
        setSelectedCustomerData(null)
        setShowSelectCustomer(false)

        if (productListRef.current) {
          productListRef.current.resetCategoryFilter()
        }
      } else {
        paymentFailedToast()
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      paymentFailedToast()
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGuestCheckout = async () => {
    resetInactivityTimer()
    if (isCartEmpty) {
      return
    }
    setShowPaymentModal(true)
    setShowSelectCustomer(false)
  }

  const handlePaymentModalCancel = async () => {
    setShowPaymentModal(false)
    utils.products.getProducts.refetch()
    utils.customers.getCustomers.refetch()
    utils.categories.getCategories.refetch()
    setCartItems([])
    setIsGuestMode(false)
    setIsProcessing(false)
    setShowSelectCustomer(false)
  }

  const handlePaymentPaidAsGuest = async () => {
    setShowPaymentModal(false)
    setShowSelectCustomer(false)
    setIsProcessing(true)

    const paymentFailedToast = () =>
      toast({
        title: t('pos.payment-failed'),
        description: t('pos.payment-failed-description'),
        variant: 'destructive',
      })

    try {
      const success = await processGuestPayment({
        items: cartItems,
        total: cartTotal,
        customerName: t('pos.guest'),
      })

      if (success) {
        toast({
          title: t('pos.payment-successful'),
          description: t('pos.purchase-registered-as-guest'),
          variant: 'success',
        })

        utils.products.getProducts.refetch()
        utils.customers.getCustomers.refetch()
        utils.categories.getCategories.refetch()
        setCartItems([])
        setIsGuestMode(false)
        if (productListRef.current) {
          productListRef.current.resetCategoryFilter()
        }
      } else {
        paymentFailedToast()
      }
    } catch (error) {
      console.error('Error processing guest payment:', error)
      paymentFailedToast()
    } finally {
      setIsProcessing(false)
    }
  }

  const cartItemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  )

  return (
    <>
      <div className="bg-gray-50 dark:bg-pos-bg">
        <main className="container mx-auto p-4 min-h-screen max-h-screen">
          <div className="flex flex-col lg:flex-row gap-6 h-[95vh]">
            <div className="w-full lg:w-2/3">
              <ProductList addToCart={addToCart} ref={productListRef} />
            </div>
            <LayoutGroup>
              <div className="w-full lg:w-1/3 h-full flex flex-col">
                <div>
                  <Cart
                    items={cartItems}
                    removeFromCart={removeFromCart}
                    updateQuantity={updateQuantity}
                  />
                </div>
                <AnimatePresence initial={false}>
                  {cartItems.length > 0 && (
                    <motion.div
                      key="totals-card"
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{
                        type: 'spring',
                        stiffness: 80,
                        damping: 28,
                        mass: 1.1,
                      }}
                      className="mt-6 flex-1 flex"
                    >
                      <TotalsCard
                        cartItemCount={cartItemCount}
                        cartTotal={cartTotal}
                        onPlaceOrder={() => setShowSelectCustomer(true)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </LayoutGroup>
          </div>
        </main>

        <CheckoutDialog
          open={showSelectCustomer}
          onOpenChange={handleDialogClose}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          onCustomerSelect={handleCustomerSelect}
          customers={customers || []}
          isGuestMode={isGuestMode}
          setIsGuestMode={setIsGuestMode}
          isProcessing={isProcessing}
          onCheckout={handleCheckout}
          onGuestCheckout={handleGuestCheckout}
          hasItems={!isCartEmpty}
          fontClass={nunito.className}
        />

        <PaymentModal
          isOpen={showPaymentModal}
          onSuccess={handlePaymentPaidAsGuest}
          onCancel={handlePaymentModalCancel}
          amount={cartTotal}
        />
      </div>
      <ScreensaverWrapper
        products={products || []}
        inactivityTimerRef={inactivityTimerRef}
      />
    </>
  )
}

POS.displayName = 'POS'

export default POS
