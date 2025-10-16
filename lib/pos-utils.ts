import type { CartItem, Product } from '@/lib/types'

export function computeCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0)
}

export function computeCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function findExistingCartItemIndex(
  items: CartItem[],
  productId: string,
  variantId?: string,
): number {
  return items.findIndex(
    (item) =>
      item.productId === productId &&
      ((!item.variant && !variantId) || item.variant?.id === variantId),
  )
}

export function buildCartItem(
  id: string,
  product: Product,
  price: number,
  variantId?: string,
  variantName?: string,
): CartItem {
  return {
    id,
    productId: product.id,
    name: product.name,
    price,
    image: product.image,
    quantity: 1,
    variant: variantId ? { id: variantId, name: variantName || '' } : undefined,
  }
}
