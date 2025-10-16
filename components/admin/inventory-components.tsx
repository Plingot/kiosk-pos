import { useTranslation } from '@/hooks/use-translation'
import type { Product } from '@/lib/types'
import React, { memo } from 'react'
import { Badge } from '../ui/badge'
import { useCurrencyFormat } from '@/lib/currency'
import type { ProductSalesData } from './inventory-tab'
import { TableCell, TableRow } from '../ui/table'

const RenderSalesData = memo(
  ({
    salesData,
    product,
  }: {
    salesData: ProductSalesData
    product: Product
  }): React.ReactNode => {
    const { t } = useTranslation()
    const currencyFormat = useCurrencyFormat()

    const productSales = salesData[product.id]

    if (!productSales) {
      return (
        <div className="text-muted-foreground">
          {t('admin.inventory.no-sales')}
        </div>
      )
    }

    if (
      product.variants &&
      product.variants.length > 0 &&
      productSales.variantSales
    ) {
      const variantsToShow = product.variants.filter(
        (v) =>
          productSales.variantSales &&
          productSales.variantSales[v.id] &&
          productSales.variantSales[v.id].totalSold > 0,
      )

      if (variantsToShow.length === 0) {
        return (
          <div className="text-muted-foreground">
            {t('admin.inventory.no-sales')}
          </div>
        )
      }

      return (
        <div className="flex flex-col gap-4">
          {variantsToShow.map((v) => {
            const variantSales = productSales.variantSales![v.id]
            return (
              <React.Fragment key={v.id}>
                <div className="flex items-center justify-end gap-2">
                  <span className="font-medium">{v.name}:</span>
                  <Badge
                    variant="secondary"
                    className={getClassNameForBadgeOnStock(v.stock)}
                  >
                    {variantSales.totalSold} {t('admin.inventory.pc')}
                  </Badge>
                  <Badge variant="secondary">
                    {currencyFormat(variantSales.totalRevenue)}
                  </Badge>
                </div>
              </React.Fragment>
            )
          })}
          <div className="mt-6 flex grow items-center justify-end gap-2">
            <span className="font-medium">{t('admin.inventory.total')}:</span>
            <Badge variant="secondary">
              {productSales.totalSold} {t('admin.inventory.pc')}
            </Badge>
            <Badge variant="secondary">
              {currencyFormat(productSales.totalRevenue)}
            </Badge>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-end gap-2">
        <Badge variant="secondary">
          {productSales.totalSold} {t('admin.inventory.pc')}
        </Badge>
        <Badge variant="secondary">
          {currencyFormat(productSales.totalRevenue)}
        </Badge>
      </div>
    )
  },
)

RenderSalesData.displayName = 'RenderSalesData'

const getClassNameForBadgeOnStock = (stock: number) => {
  if (stock > 2) {
    return 'bg-green-300 text-black hover:bg-green-300/80'
  }
  if (stock > 0) {
    return 'bg-yellow-200 text-black hover:bg-yellow-200/80'
  }
  return 'bg-red-400 text-black hover:bg-red-400/80'
}

const RenderCurrentStock = memo(
  ({ product }: { product: Product }): React.ReactNode => {
    const { t } = useTranslation()
    const currencyFormat = useCurrencyFormat()

    if (product.variants && product.variants.length > 0) {
      return (
        <div className="flex flex-col gap-4">
          {product.variants.map((v) => {
            return (
              <React.Fragment key={v.id}>
                <div className="flex items-center justify-end gap-2">
                  <span className="font-medium">{v.name}:</span>
                  <Badge
                    variant="secondary"
                    className={getClassNameForBadgeOnStock(v.stock)}
                  >
                    {v.stock} {t('admin.inventory.pc')}
                  </Badge>
                  <Badge variant="secondary">
                    {currencyFormat(v.price * v.stock)}
                  </Badge>
                </div>
              </React.Fragment>
            )
          })}
          <div className="mt-6 flex items-center justify-end gap-2">
            <span className="font-medium">{t('admin.inventory.total')}:</span>
            <Badge variant="secondary">
              {product.variants.reduce((sum, v) => sum + v.stock, 0)}{' '}
              {t('admin.inventory.pc')}
            </Badge>
            <Badge variant="secondary">
              {currencyFormat(
                product.variants.reduce((sum, v) => sum + v.price * v.stock, 0),
              )}
            </Badge>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-end gap-2">
        <Badge variant="secondary">
          {product.stock} {t('admin.inventory.pc')}
        </Badge>
        <Badge variant="secondary">
          {currencyFormat(product.price * product.stock)}
        </Badge>
      </div>
    )
  },
)

RenderCurrentStock.displayName = 'RenderCurrentStock'

const UnlistedProducts = memo(
  ({
    salesData,
    filteredProducts,
  }: {
    salesData: ProductSalesData
    filteredProducts: Product[]
  }): React.ReactNode => {
    const { t } = useTranslation()
    const currencyFormat = useCurrencyFormat()

    return (
      <TableRow>
        <TableCell></TableCell>
        <TableCell className="font-medium">
          {t('admin.inventory.unlisted-products')}
        </TableCell>
        <TableCell className="text-right"></TableCell>
        <TableCell className="text-right">
          {(() => {
            const shownIds = new Set(filteredProducts.map((p) => p.id))
            const notListedSales = Object.entries(salesData).filter(
              ([id]) => !shownIds.has(id),
            )
            const totalSold = notListedSales.reduce(
              (sum, [, data]) => sum + data.totalSold,
              0,
            )
            const totalRevenue = notListedSales.reduce(
              (sum, [, data]) => sum + data.totalRevenue,
              0,
            )
            return (
              <div className="pt-6 flex items-center justify-end gap-2">
                <span className="font-medium">
                  {t('admin.inventory.total')}:
                </span>
                <Badge variant="secondary">
                  {totalSold} {t('admin.inventory.pc')}
                </Badge>
                <Badge variant="secondary">
                  {currencyFormat(totalRevenue)}
                </Badge>
              </div>
            )
          })()}
        </TableCell>
      </TableRow>
    )
  },
)

UnlistedProducts.displayName = 'UnlistedProducts'

const TotalSold = memo(
  ({
    salesData,
    products,
  }: {
    salesData: ProductSalesData
    products: Product[]
  }): React.ReactNode => {
    const { t } = useTranslation()
    const currencyFormat = useCurrencyFormat()

    const totalStockValue = products?.reduce(
      (sum, p) =>
        sum +
        (p.variants && p.variants.length > 0
          ? p.variants.reduce((sum, v) => sum + v.price * v.stock, 0)
          : p.price * p.stock),
      0,
    )

    const totalSales = Object.values(salesData).reduce(
      (sum, p) => sum + p.totalRevenue,
      0,
    )

    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          {t('admin.inventory.total-stock-value')}:{' '}
          {currencyFormat(totalStockValue)}
        </p>
        <p className="text-sm text-muted-foreground">
          {t('admin.inventory.total-sales')}: {currencyFormat(totalSales)}
        </p>
      </div>
    )
  },
)

TotalSold.displayName = 'TotalSold'

export { RenderSalesData, RenderCurrentStock, UnlistedProducts, TotalSold }
