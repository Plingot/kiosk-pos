import type { ProductSalesData } from '@/components/admin/inventory-tab'
import type { Transaction, CartItem } from './types'

export const calculateSalesData = (
  transactions: Transaction[],
): ProductSalesData => {
  const salesData: ProductSalesData = {}

  transactions.forEach((transaction) => {
    transaction.items.forEach((item: CartItem) => {
      if (!salesData[item.productId]) {
        salesData[item.productId] = {
          totalSold: 0,
          totalRevenue: 0,
          variantSales: {},
        }
      }

      salesData[item.productId].totalSold += item.quantity
      salesData[item.productId].totalRevenue += item.price * item.quantity

      if (item.variant) {
        if (!salesData[item.productId].variantSales) {
          salesData[item.productId].variantSales = {}
        }

        if (!salesData[item.productId].variantSales![item.variant.id]) {
          salesData[item.productId].variantSales![item.variant.id] = {
            totalSold: 0,
            totalRevenue: 0,
          }
        }

        salesData[item.productId].variantSales![item.variant.id].totalSold +=
          item.quantity
        salesData[item.productId].variantSales![item.variant.id].totalRevenue +=
          item.price * item.quantity
      }
    })
  })

  return salesData
}
