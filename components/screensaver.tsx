'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { Product } from '@/lib/types'
import { useCurrencyFormat } from '@/lib/currency'
import { useTranslation } from '@/hooks/use-translation'

interface ScreensaverProps {
  products: Product[]
  onExit: () => void
  inactivityTimerRef: React.RefObject<NodeJS.Timeout | null>
}

const INACTIVITY_TIMEOUT = 30000 // 30 seconds
const SCREEN_SAVER_ENABLED = process.env.NEXT_PUBLIC_SCREENSAVER === 'true'

export const ScreensaverWrapper = ({
  products,
  inactivityTimerRef,
}: Omit<ScreensaverProps, 'onExit'>) => {
  const [showScreensaver, setShowScreensaver] = useState(false)

  const resetInactivityTimer = useCallback(() => {
    if (SCREEN_SAVER_ENABLED) {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }

      inactivityTimerRef.current = setTimeout(() => {
        setShowScreensaver(true)
      }, INACTIVITY_TIMEOUT)
    }
  }, [])

  useEffect(() => {
    resetInactivityTimer()
    const handleUserActivity = () => {
      resetInactivityTimer()
    }
    window.addEventListener('mousemove', handleUserActivity)
    window.addEventListener('mousedown', handleUserActivity)
    window.addEventListener('keypress', handleUserActivity)
    window.addEventListener('touchstart', handleUserActivity)
    window.addEventListener('scroll', handleUserActivity)
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
      window.removeEventListener('mousemove', handleUserActivity)
      window.removeEventListener('mousedown', handleUserActivity)
      window.removeEventListener('keypress', handleUserActivity)
      window.removeEventListener('touchstart', handleUserActivity)
      window.removeEventListener('scroll', handleUserActivity)
    }
  }, [resetInactivityTimer])

  const exitScreensaver = useCallback(() => {
    setShowScreensaver(false)
    resetInactivityTimer()
  }, [resetInactivityTimer])

  if (showScreensaver) {
    return <Screensaver products={products} onExit={exitScreensaver} />
  }

  return null
}

function Screensaver({
  products,
  onExit,
}: Omit<ScreensaverProps, 'inactivityTimerRef'>) {
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([])
  const currencyFormat = useCurrencyFormat()

  const { t } = useTranslation()

  useEffect(() => {
    const validProducts = products.filter((product) => {
      const hasImage = product.image && product.image !== '/placeholder.svg'
      const hasStock =
        product.stock > 0 ||
        (product.variants && product.variants.some((v) => v.stock > 0))
      return hasImage && hasStock
    })
    setDisplayedProducts(validProducts.length > 0 ? validProducts : products)
  }, [products])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProductIndex((prevIndex) =>
        prevIndex === displayedProducts.length - 1 ? 0 : prevIndex + 1,
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [displayedProducts])

  const handleClick = () => {
    onExit()
  }

  if (displayedProducts.length === 0) {
    return (
      <div
        className="fixed inset-0 bg-black flex items-center justify-center text-white text-2xl"
        onClick={handleClick}
      >
        {t('screensaver.click-to-continue')}
      </div>
    )
  }

  const currentProduct = displayedProducts[currentProductIndex]

  const displayPrice =
    currentProduct.variants && currentProduct.variants.length > 0
      ? currentProduct.variants[0].price
      : currentProduct.price

  return (
    <div
      className="fixed inset-0 bg-white overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentProductIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="w-full h-full flex flex-col items-center justify-center p-8"
        >
          <div className="relative w-screen h-screen mb-8">
            <Image
              src={currentProduct.image || '/placeholder.svg'}
              alt={currentProduct.name}
              fill
              className="object-contain"
              priority
            />
          </div>

          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="bg-[#E55456] absolute top-14 left-14 text-white p-6 rounded-xl shadow-lg"
          >
            <h2 className="text-4xl font-bold mb-2 text-center">
              {currentProduct.name}
            </h2>
            <p className="text-6xl font-bold text-center">
              {currencyFormat(displayPrice)}
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

Screensaver.displayName = 'Screensaver'

export default Screensaver
