import { Card, CardContent } from '../ui/card'
import { type Product } from '@/lib/types'
import { Button } from '../ui/button'
import { AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Nunito_Sans } from 'next/font/google'
import Image from 'next/image'
import { useCurrencyFormat } from '@/lib/currency'
import { useTranslation } from '@/hooks/use-translation'
import { memo, useCallback } from 'react'

const nunito = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-nunito',
})

const ProductCard = memo(
  ({
    product,
    isOutOfStock,
    handleProductClick,
    hasVariants,
    requestingProduct,
    handleRequestProduct,
  }: {
    product: Product
    isOutOfStock?: boolean
    handleProductClick: (product: Product) => void
    hasVariants?: boolean | null
    requestingProduct?: string | null
    handleRequestProduct: (e: React.MouseEvent, product: Product) => void
  }) => {
    const currencyFormat = useCurrencyFormat()
    const { t } = useTranslation()

    const handleClick = useCallback(() => {
      if (isOutOfStock) {
        return
      }

      handleProductClick(product)
    }, [isOutOfStock, handleProductClick, product])

    const returnPrice = useCallback(() => {
      let str = ''
      if ([...new Set(product.variants?.map((v) => v.price))]?.length > 1) {
        str += t('pos.fr')
      }

      str += currencyFormat(
        product.variants?.length && product.variants.length > 0
          ? Math.min(...(product.variants?.map((v) => v.price) || []))
          : product.price,
      )

      return str
    }, [product.variants, product.price, t, currencyFormat])

    return (
      <Card
        key={product.id}
        className={`relative overflow-hidden active:scale-90 hover:border-2 hover:border-[#FBC9DE] dark:hover:border-[#FBC9DE] transition transform
        dark:bg-pos-bgSecondary dark:border-pos-borderSecondary
        ${isOutOfStock ? 'opacity-60' : 'hover:shadow-sm cursor-pointer'}`}
        onClick={handleClick}
      >
        <CardContent className="relative z-10 p-0">
          <div className="relative m-2 aspect-square rounded-md bg-gray-100 dark:bg-gray-100">
            <Image
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="flex flex-col p-4">
            <h3
              className={cn(
                'font-medium text-md mb-1 dark:text-white line-clamp-1 text-ellipsis max-w-[99%]',
                nunito.className,
              )}
            >
              {product.name}
            </h3>

            <div className="flex justify-between items-center">
              {!isOutOfStock && (
                <p
                  className={cn(
                    'dark:text-slate-400 text-md',
                    nunito.className,
                  )}
                >
                  {returnPrice()}
                </p>
              )}

              <div className="text-right">
                {!hasVariants && product.stock > 0 && (
                  <span className="text-xs text-muted-foreground dark:text-slate-400">
                    {product.stock} {t('pos.in-stock')}
                  </span>
                )}
              </div>
            </div>

            {isOutOfStock && (
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'w-full text-amber-600 border-amber-600 hover:bg-amber-50 dark:bg-pos-bgSecondary',
                    nunito.className,
                  )}
                  onClick={(e) => handleRequestProduct(e, product)}
                  disabled={requestingProduct === product.id}
                >
                  {requestingProduct === product.id ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  )}
                  {t('pos.variant-modal.request')}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  },
)

ProductCard.displayName = 'ProductCard'

export default ProductCard
