import type { Product, ProductVariant } from '@/lib/types'
import type { useTranslation } from '@/hooks/use-translation'

export function computeStockAggregation(
  currentStock: number,
  currentPurchasePrice: number,
  addStock: number,
  newPurchasePrice: number,
  markup: number,
) {
  const totalStock = currentStock + addStock
  if (totalStock === 0) {
    const p = newPurchasePrice || 0
    return { stock: 0, purchasePrice: p, price: Math.round(p * markup) }
  }
  const weighted = Number(
    (currentPurchasePrice * currentStock + newPurchasePrice * addStock) /
      totalStock,
  )
  return {
    stock: totalStock,
    purchasePrice: weighted,
    price: Math.round(weighted * markup),
  }
}

export function validateProductForm(args: {
  name: string
  hasVariants: boolean
  price: string
  stock: string
  variants: ProductVariant[]
  onError: (msg: string) => void
  t: ReturnType<typeof useTranslation>['t']
}) {
  const { name, hasVariants, price, stock, variants, onError, t } = args
  if (!name.trim()) {
    onError(t('admin.products.product-name-must-be-provided'))
    return false
  }
  if (!hasVariants) {
    const p = Number.parseFloat(price)
    if (!price.trim() || Number.isNaN(p) || p <= 0) {
      onError(t('admin.products.price-must-be-provided-and-greater-than-0'))
      return false
    }
    const s = Number.parseInt(stock)
    if (Number.isNaN(s) || s < 0) {
      onError(t('admin.products.stock-must-be-a-positive-integer'))
      return false
    }
  }
  for (const v of variants) {
    if (!v.name.trim()) {
      onError(t('admin.products.all-variants-must-have-a-name'))
      return false
    }
    if ((v.price ?? 0) <= 0) {
      onError(t('admin.products.variant-price-must-be-greater-than-0'))
      return false
    }
    if ((v.stock ?? 0) < 0) {
      onError(t('admin.products.variant-stock-must-be-a-positive-integer'))
      return false
    }
  }
  return true
}

export function buildProductPayload(args: {
  name: string
  price: string
  stock: string
  purchasePrice: string
  image: string
  variants: ProductVariant[]
  relatedProductIds: string[]
  categoryId: string | undefined
  hasVariants: boolean
}): Omit<Product, 'id'> {
  const {
    name,
    price,
    stock,
    purchasePrice,
    image,
    variants,
    relatedProductIds,
    categoryId,
    hasVariants,
  } = args

  return {
    name,
    price: Number.parseFloat(price || '0'),
    stock: hasVariants ? 0 : Number.parseInt(stock || '0'),
    purchasePrice: hasVariants ? 0 : Number.parseFloat(purchasePrice || '0'),
    image,
    variants: variants.length > 0 ? variants : null,
    relatedProductIds: relatedProductIds.length > 0 ? relatedProductIds : null,
    categoryId,
  }
}
