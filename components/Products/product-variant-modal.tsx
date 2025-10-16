'use client'

import type React from 'react'
import { memo, useMemo, useState } from 'react'
import Image from 'next/image'
import type { Product } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Nunito_Sans } from 'next/font/google'
import { useCurrencyFormat } from '@/lib/currency'
import { useTranslation } from '@/hooks/use-translation'

const nunito = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-nunito',
})

interface ProductVariantModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product, variantId?: string) => void
  onRequestProduct: (
    e: React.MouseEvent,
    product: Product,
    variantId?: string,
    variantName?: string,
  ) => void
  requestingProduct: string | null
}

const ProductVariantModal = memo(
  ({
    product,
    isOpen,
    onClose,
    onAddToCart,
    onRequestProduct,
    requestingProduct,
  }: ProductVariantModalProps) => {
    const [selectedVariantId, setSelectedVariantId] = useState<
      string | undefined
    >(
      product.variants && product.variants.length > 0
        ? product.variants[0].id
        : undefined,
    )
    const currencyFormat = useCurrencyFormat()
    const { t } = useTranslation()

    const sortedVariants = useMemo(
      () =>
        product.variants && product.variants.length > 0
          ? [...product.variants].sort((a, b) => b.stock - a.stock)
          : [],
      [product.variants],
    )

    const selectedVariant = useMemo(
      () => sortedVariants.find((v) => v.id === selectedVariantId),
      [sortedVariants, selectedVariantId],
    )

    const isOutOfStock = useMemo(
      () => (selectedVariant ? selectedVariant.stock : product.stock) <= 0,
      [selectedVariant, product.stock],
    )

    const baseText = cn('dark:text-white', nunito.className)
    const mutedText = cn(
      'text-sm text-muted-foreground dark:text-slate-400',
      nunito.className,
    )
    const outlineBtn = cn(
      'dark:bg-pos-bg dark:text-white dark:border-pos-borderSecondary py-6 px-6 rounded-lg',
      nunito.className,
    )
    const primaryBtn = cn(
      'bg-[#FBC9DE] text-black dark:border-pos-borderSecondary py-6 px-6 rounded-lg',
      nunito.className,
    )

    const handleAddToCart = () => {
      onAddToCart(product, selectedVariantId)
      onClose()
    }

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[50vw]">
          <DialogHeader>
            <DialogTitle>{t('pos.variant-modal.title')}</DialogTitle>
          </DialogHeader>

          {sortedVariants.length > 0 ? (
            <RadioGroup
              value={selectedVariantId}
              onValueChange={setSelectedVariantId}
              className="gap-4 overflow-y-auto no-scollbar max-h-[70vh]"
            >
              {sortedVariants.map((variant) => (
                <div
                  key={variant.id}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={cn(
                    `flex flex-col border dark:bg-pos-bg dark:border-pos-borderSecondary rounded-lg p-4 ${
                      variant.stock <= 0 ? 'opacity-50' : ''
                    }`,
                    variant.id === selectedVariantId
                      ? 'border-2 border-[#FBC9DE] dark:border-[#FBC9DE]'
                      : '',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-100">
                        <Image
                          src={variant.image || '/placeholder.svg'}
                          alt={variant.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value={variant.id}
                          id={variant.id}
                          disabled={variant.stock <= 0}
                          className=" hidden"
                        />
                        <Label
                          htmlFor={variant.id}
                          className={cn('cursor-pointer', baseText)}
                        >
                          {variant.name}
                        </Label>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={cn('font-medium', baseText)}>
                        {currencyFormat(variant.price)}
                      </div>
                      <div className={mutedText}>
                        {variant.stock > 0
                          ? `${variant.stock} ${t('pos.variant-modal.in-stock')}`
                          : `${t('pos.variant-modal.out-of-stock')}`}
                      </div>
                    </div>
                  </div>

                  {variant.stock <= 0 && (
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          'w-full text-amber-600 border-amber-600 hover:bg-amber-50 dark:bg-pos-bgSecondary',
                          nunito.className,
                        )}
                        onClick={(e) =>
                          onRequestProduct(e, product, variant.id, variant.name)
                        }
                        disabled={requestingProduct === variant.id}
                      >
                        {requestingProduct === variant.id ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        )}
                        {t('pos.variant-modal.request')}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              {t('pos.variant-modal.no-variants')}
            </div>
          )}

          <DialogFooter className="!justify-between">
            <Button variant="outline" className={outlineBtn} onClick={onClose}>
              {t('pos.variant-modal.cancel')}
            </Button>
            <Button
              onClick={handleAddToCart}
              className={primaryBtn}
              disabled={isOutOfStock}
            >
              {t('pos.variant-modal.add-to-cart')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  },
)

ProductVariantModal.displayName = 'ProductVariantModal'

export default ProductVariantModal
