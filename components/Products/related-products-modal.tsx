'use client'

import { memo, useCallback, useState } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Nunito_Sans } from 'next/font/google'
import { useCurrencyFormat } from '@/lib/currency'
import { useTranslation } from '@/hooks/use-translation'

const nunito = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-nunito',
})

interface RelatedProductsModalProps {
  isOpen: boolean
  onClose: () => void
  relatedProducts: Product[]
  onAddToCart: (product: Product, variantId?: string) => void
  setSelectedProduct: (product: Product | null) => void
}

const RelatedProductsModal = memo(function RelatedProductsModal({
  isOpen,
  onClose,
  relatedProducts,
  onAddToCart,
  setSelectedProduct,
}: RelatedProductsModalProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(),
  )
  const { t } = useTranslation()
  const currencyFormat = useCurrencyFormat()

  const toggleProductSelection = useCallback(
    (productId: string) => {
      const product = relatedProducts?.find(
        (product) => product.id === productId,
      )

      if (product?.variants && product?.variants.length > 0) {
        setSelectedProduct(product)
        onClose()
        return
      }

      if (product?.stock || 0 === 0) {
        return
      }

      setSelectedProducts((prev) => {
        const newSelection = new Set(prev)
        if (newSelection.has(productId)) {
          newSelection.delete(productId)
        } else {
          newSelection.add(productId)
        }
        return newSelection
      })
    },
    [onClose, relatedProducts, setSelectedProduct],
  )

  const handleAddToCart = useCallback(() => {
    relatedProducts.forEach((product) => {
      if (selectedProducts.has(product.id)) {
        onAddToCart(product)
      }
    })
    onClose()
  }, [relatedProducts, selectedProducts, onAddToCart, onClose])

  const outOfStock = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.every((variant) => variant.stock <= 0)
    }
    return product.stock <= 0
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('pos.related-products.title')}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex flex-wrap gap-4">
            {relatedProducts.map((product) => (
              <div
                key={product.id}
                className={cn(
                  `border dark:bg-pos-bg rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedProducts.has(product.id)
                      ? 'border-2 !border-[#FBC9DE] dark:!border-[#FBC9DE]'
                      : 'dark:border-pos-borderSecondary'
                  }`,
                  outOfStock(product) ? 'opacity-50' : '',
                )}
                onClick={() => toggleProductSelection(product.id)}
              >
                <div className="flex flex-col gap-4">
                  <div className="relative h-[150px] w-[150px] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-100">
                    <Image
                      src={product.image || '/placeholder.svg'}
                      alt={product.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="p-1">
                    <h3
                      className={cn(
                        'font-medium dark:text-white',
                        nunito.className,
                      )}
                    >
                      {product.name}
                    </h3>
                    <p
                      className={cn(
                        'text-sm text-muted-foreground dark:text-slate-400',
                        nunito.className,
                      )}
                    >
                      {currencyFormat(product.price)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="!justify-between">
          <Button
            variant="outline"
            className={cn(
              'dark:bg-pos-bg dark:text-white dark:border-pos-borderSecondary py-6 px-6 rounded-lg',
              nunito.className,
            )}
            onClick={onClose}
          >
            {t('pos.related-products.close')}
          </Button>
          <Button
            onClick={handleAddToCart}
            className={cn(
              'bg-[#FBC9DE] text-black dark:border-pos-borderSecondary py-6 px-6 rounded-lg',
              nunito.className,
            )}
            disabled={selectedProducts.size === 0}
          >
            {t('pos.related-products.add-to-cart')} ({selectedProducts.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

RelatedProductsModal.displayName = 'RelatedProductsModal'

export default RelatedProductsModal
