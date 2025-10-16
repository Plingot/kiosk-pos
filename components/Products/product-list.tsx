'use client'

import type React from 'react'

import {
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useMemo,
  memo,
} from 'react'
import type { Product } from '@/lib/types'
import { Loader2, X } from 'lucide-react'
import ProductVariantModal from './product-variant-modal'
import RelatedProductsModal from './related-products-modal'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { Nunito_Sans } from 'next/font/google'
import { useTranslation } from '@/hooks/use-translation'
import { sendRequestNotification } from '@/lib/notifications'
import { LanguageSwitcher } from '../language-switcher'
import { api } from '@/lib/trpc'
import {
  CategoryList,
  FilteredProductList,
  SearchBar,
} from './product-list-components'

const nunito = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-nunito',
})

interface ProductListProps {
  addToCart: (product: Product, variantId?: string) => void
}

const ProductList = memo(
  forwardRef<{ resetCategoryFilter: () => void }, ProductListProps>(
    ({ addToCart }, ref) => {
      const [searchTerm, setSearchTerm] = useState('')
      const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
      )
      const [requestingProduct, setRequestingProduct] = useState<string | null>(
        null,
      )
      const [showRelatedProducts, setShowRelatedProducts] = useState(false)
      const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
      const [selectedCategories, setSelectedCategories] = useState<string[]>([])

      const { data: products, isLoading: productsLoading } =
        api.products.getProducts.useQuery()
      const { data: categories, isLoading: categoriesLoading } =
        api.categories.getCategories.useQuery()
      const { mutateAsync: requestProduct } =
        api.productRequests.requestProduct.useMutation()
      const { toast } = useToast()
      const { t } = useTranslation()

      const isLoading = productsLoading || categoriesLoading

      const resetCategoryFilter = useCallback(() => {
        setSelectedCategories([])
      }, [])

      useImperativeHandle(
        ref,
        () => ({
          resetCategoryFilter,
        }),
        [resetCategoryFilter],
      )

      const toggleCategory = useCallback((categoryId: string) => {
        setSelectedCategories((prev) =>
          prev.includes(categoryId)
            ? prev.filter((id) => id !== categoryId)
            : [...prev, categoryId],
        )
      }, [])

      const normalizedSearch = useMemo(
        () => searchTerm.trim().toLowerCase(),
        [searchTerm],
      )

      const categoriesArray = useMemo(() => categories || [], [categories])

      const requestingProductMemo = useMemo(
        () => requestingProduct,
        [requestingProduct],
      )

      const filteredProducts = useMemo(() => {
        const bySearch = normalizedSearch
          ? products?.filter((p) =>
              p.name.toLowerCase().includes(normalizedSearch),
            ) || []
          : products
        if (selectedCategories.length === 0) {
          return bySearch || []
        }
        return (
          bySearch?.filter(
            (p) => p.categoryId && selectedCategories.includes(p.categoryId),
          ) || []
        )
      }, [products, normalizedSearch, selectedCategories])

      const handleAddToCart = useCallback(
        (product: Product, variantId?: string) => {
          addToCart(product, variantId)
          if (
            product.relatedProductIds &&
            product.relatedProductIds.length > 0
          ) {
            const related = products?.filter((p) =>
              product.relatedProductIds?.includes(p.id),
            )
            if (related?.length && related.length > 0) {
              setRelatedProducts(related)
              setShowRelatedProducts(true)
            }
          }
        },
        [addToCart, products],
      )

      const handleProductClick = useCallback(
        (product: Product) => {
          if (product.variants && product.variants.length > 0) {
            setSelectedProduct(product)
            return
          }
          if (product.stock > 0) {
            handleAddToCart(product)
          }
        },
        [handleAddToCart],
      )

      const handleCloseModal = useCallback(() => {
        setSelectedProduct(null)
      }, [])

      const handleCloseRelatedModal = useCallback(() => {
        setShowRelatedProducts(false)
        setRelatedProducts([])
      }, [])

      const handleRequestProduct = useCallback(
        async (
          e: React.MouseEvent,
          product: Product,
          variantId?: string,
          variantName?: string,
        ) => {
          e.stopPropagation()

          try {
            setRequestingProduct(variantId || product.id)
            await requestProduct({
              productId: product.id,
              productName: product.name,
              variantId,
              variantName,
            })

            await sendRequestNotification(product, t, variantName)
            toast({
              title: t('pos.product-requested'),
              description: `${product.name}${
                variantName ? ` (${variantName})` : ''
              } ${t('pos.product-requested-description')}`,
            })
          } catch (error) {
            console.error('Error requesting product:', error)
            toast({
              title: t('pos.product-requested-error'),
              description: t('pos.product-requested-error-description'),
              variant: 'destructive',
            })
          } finally {
            setRequestingProduct(null)
          }
        },
        [],
      )

      if (isLoading) {
        return (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-white mb-4" />
          </div>
        )
      }

      return (
        <div className="space-y-4">
          <div className="flex items-center mb-6 gap-4">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <LanguageSwitcher
              className={cn(
                'rounded-lg h-[45px] w-[150px] dark:bg-pos-bgSecondary dark:text-white dark:border-pos-borderSecondary',
                nunito.className,
              )}
            />
          </div>
          <div className="mb-6">
            <div className="flex flex-wrap gap-3 overflow-x-scroll no-scrollbar overflow-y-visible py-1">
              <CategoryList
                categories={categoriesArray}
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
              />
              {selectedCategories.length > 0 && (
                <button
                  onClick={resetCategoryFilter}
                  className={cn(
                    `px-4 py-4 items-start justify-end rounded-xl flex flex-col gap-2 pr-10 text-sm font-semibold transition-all bg-white dark:bg-pos-bgSecondary`,
                    nunito.className,
                  )}
                >
                  <X className="w-4 h-4 mb-2" />
                  <span>{t('pos.clear')}</span>
                </button>
              )}
            </div>
          </div>

          <hr className="my-4 border-slate-200 dark:border-pos-borderSecondary/50" />

          <FilteredProductList
            filteredProducts={filteredProducts}
            handleProductClick={handleProductClick}
            handleRequestProduct={handleRequestProduct}
            requestingProduct={requestingProductMemo}
          />

          {selectedProduct && (
            <ProductVariantModal
              product={selectedProduct}
              isOpen={!!selectedProduct}
              onClose={handleCloseModal}
              onAddToCart={handleAddToCart}
              onRequestProduct={handleRequestProduct}
              requestingProduct={requestingProduct}
            />
          )}

          {showRelatedProducts && (
            <RelatedProductsModal
              isOpen={showRelatedProducts}
              onClose={handleCloseRelatedModal}
              relatedProducts={relatedProducts}
              onAddToCart={addToCart}
              setSelectedProduct={setSelectedProduct}
            />
          )}
        </div>
      )
    },
  ),
)

ProductList.displayName = 'ProductList'

export default ProductList
