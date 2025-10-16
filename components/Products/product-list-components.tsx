import { memo } from 'react'
import { Input } from '../ui/input'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Nunito_Sans } from 'next/font/google'
import { useTranslation } from '@/hooks/use-translation'
import { getPastelColor } from '@/lib/get-pastel-color'
import type { Category, Product } from '@/lib/types'
import ProductCard from './product-card'
import { DynamicIcon } from '../dynamic-icon'

const nunito = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-nunito',
})

const SearchBar = memo(
  ({
    searchTerm,
    setSearchTerm,
  }: {
    searchTerm: string
    setSearchTerm: (value: string) => void
  }) => {
    const { t } = useTranslation()

    return (
      <div className="relative grow">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t('pos.search')}
          className={cn(
            'pl-10 rounded-lg h-[45px] dark:bg-pos-bgSecondary dark:text-white dark:border-pos-borderSecondary',
            nunito.className,
          )}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    )
  },
)

SearchBar.displayName = 'SearchBar'

const FilteredProductList = memo(
  ({
    filteredProducts,
    handleProductClick,
    handleRequestProduct,
    requestingProduct,
  }: {
    filteredProducts: Product[]
    handleProductClick: (product: Product) => void
    handleRequestProduct: (e: React.MouseEvent, product: Product) => void
    requestingProduct: string | null
  }) => {
    const { t } = useTranslation()

    if (filteredProducts?.length === 0) {
      return (
        <div
          className={cn(
            'text-center py-8 text-muted-foreground text-black dark:text-white',
            nunito.className,
          )}
        >
          {t('pos.here-is-nothing')}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 overflow-y-scroll no-scrollbar max-h-[69vh] rounded-md lg:grid-cols-4 gap-4">
        {filteredProducts?.map((product) => {
          const hasVariants = product.variants && product.variants.length > 0
          const isOutOfStock = hasVariants
            ? product.variants?.every((v) => v.stock <= 0)
            : product.stock <= 0

          return (
            <ProductCard
              key={product.id}
              product={product}
              isOutOfStock={isOutOfStock}
              handleProductClick={handleProductClick}
              handleRequestProduct={handleRequestProduct}
              requestingProduct={requestingProduct}
              hasVariants={hasVariants}
            />
          )
        })}
      </div>
    )
  },
)

FilteredProductList.displayName = 'FilteredProductList'

const CategoryList = memo(
  ({
    categories,
    selectedCategories,
    toggleCategory,
  }: {
    categories: Category[]
    selectedCategories: string[]
    toggleCategory: (categoryId: string) => void
  }) => {
    return categories?.map((category) => {
      const isSelected = selectedCategories.includes(category.id)
      const bgColor = getPastelColor(category.id)

      return (
        <button
          key={category.id}
          onClick={() => toggleCategory(category.id)}
          className={cn(
            `px-4 py-4 items-start justify-end rounded-xl flex flex-col gap-2 pr-10 text-sm font-semibold transition-all ${
              isSelected
                ? 'ring-2 ring-offset-2 ring-primary'
                : 'hover:opacity-80'
            }`,
            nunito.className,
          )}
          style={{
            backgroundColor: bgColor,
            color: 'rgba(0, 0, 0, 0.7)',
          }}
        >
          {category.icon && (
            <DynamicIcon className="w-4 h-4 mb-2" name={category.icon} />
          )}
          <span>{category.title}</span>
        </button>
      )
    })
  },
)

CategoryList.displayName = 'CategoryList'

export { FilteredProductList, SearchBar, CategoryList }
