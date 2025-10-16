import { createTRPCRouter, publicProcedure } from '../trpc'
import { z } from 'zod'
import { db } from '@/server/db'
import { CartItemSchema, type CartItem } from '@/lib/types'

function sanitizeCartItem(item: CartItem) {
  return {
    id: item.id || '',
    productId: item.productId || '',
    name: item.name || '',
    price: item.price || 0,
    image: item.image || '',
    quantity: item.quantity || 0,
    variantId: item.variant?.id ?? null,
  }
}

const updateStock = async (items: ReturnType<typeof sanitizeCartItem>[]) => {
  for (const item of items) {
    if (item.variantId) {
      const variant = await db.productVariant.findUnique({
        where: { id: item.variantId },
      })
      if (!variant) {
        return false
      }

      const currentStock = variant.stock
      const newStock = Math.max(0, currentStock - item.quantity)
      await db.productVariant.update({
        where: { id: item.variantId },
        data: { stock: newStock },
      })
    } else {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      })
      if (!product) {
        return false
      }

      const currentStock = product.stock
      const newStock = Math.max(0, currentStock - item.quantity)
      await db.product.update({
        where: { id: item.productId },
        data: { stock: newStock },
      })
    }
  }
}

export const purchaseRouter = createTRPCRouter({
  processPayment: publicProcedure
    .input(
      z.object({
        customerId: z.string(),
        customerName: z.string(),
        items: z.array(CartItemSchema),
        total: z.number(),
      }),
    )
    .output(z.boolean())
    .mutation(async ({ input }) => {
      if (
        !input.customerId ||
        !input.customerName ||
        !input.items ||
        !input.total
      ) {
        return false
      }
      const sanitizedItems = input.items.map((item) => sanitizeCartItem(item))

      const customer = await db.customer.findUnique({
        where: { id: input.customerId },
      })
      if (!customer) {
        return false
      }

      updateStock(sanitizedItems)

      const transactionData = {
        customerId: input.customerId,
        customerName: input.customerName,
        items: {
          create: sanitizedItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            variantId: item.variantId ?? null,
          })),
        },
        total: input.total,
        timestamp: new Date(),
        paid: false,
        pending: false,
      }

      await db.transaction.create({
        data: transactionData,
        include: { items: true },
      })

      return true
    }),
  processGuestPayment: publicProcedure
    .input(
      z.object({
        items: z.array(CartItemSchema),
        total: z.number(),
        customerName: z.string(),
      }),
    )
    .output(z.boolean())
    .mutation(async ({ input }) => {
      if (!input.items || !input.total) {
        return false
      }
      const sanitizedItems = input.items.map((item) => sanitizeCartItem(item))

      await updateStock(sanitizedItems)

      const transactionData = {
        customerId: 'guest',
        customerName: input.customerName,
        items: {
          create: sanitizedItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            variantId: item.variantId ?? null,
          })),
        },
        total: input.total,
        timestamp: new Date(),
        paid: false,
        pending: false,
      }

      await db.transaction.create({
        data: transactionData,
        include: { items: true },
      })

      return true
    }),
})
