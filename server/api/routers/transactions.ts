import { createTRPCRouter, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { db } from '@/server/db'
import { TransactionSchema } from '@/lib/types'

export const transactionsRouter = createTRPCRouter({
  getTransactions: protectedProcedure
    .output(z.array(TransactionSchema))
    .query(async () => {
      const transactions = await db.transaction.findMany({
        orderBy: { timestamp: 'desc' },
        include: {
          items: {
            include: {
              variant: true,
            },
          },
        },
      })
      return transactions.map((transaction) => ({
        id: transaction.id,
        customerId: transaction.customerId,
        customerName: transaction.customerName,
        items: transaction.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          variant: item.variantId
            ? {
                id: item.variant?.id ?? '',
                name: item.variant?.name ?? '',
                image: item.variant?.image ?? '',
              }
            : undefined,
        })),
        total: transaction.total,
        timestamp: transaction.timestamp,
        paid: transaction.paid ?? undefined,
        pending: transaction.pending ?? undefined,
      }))
    }),
  updateTransaction: protectedProcedure
    .input(z.object({ transaction: TransactionSchema }))
    .output(z.void())
    .mutation(async ({ input }) => {
      const transaction = {
        id: input.transaction.id,
        customerId: input.transaction.customerId,
        customerName: input.transaction.customerName,
        total: input.transaction.total,
        timestamp: input.transaction.timestamp,
        paid: input.transaction.paid ?? undefined,
        pending: input.transaction.pending ?? undefined,
      }
      await db.transaction.update({
        where: { id: input.transaction.id },
        data: transaction,
      })
      return
    }),
  updateCustomerTransactionsPending: protectedProcedure
    .input(z.object({ customerId: z.string() }))
    .output(z.void())
    .mutation(async ({ input }) => {
      await db.transaction.updateMany({
        where: { customerId: input.customerId, pending: true },
        data: { paid: true },
      })
      return
    }),
  setAllCustomerTransactionsToPending: protectedProcedure
    .input(z.object({ customerId: z.string() }))
    .output(z.void())
    .mutation(async ({ input }) => {
      await db.transaction.updateMany({
        where: { customerId: input.customerId, paid: false },
        data: { pending: true, paid: false },
      })
      return
    }),
  resetAllTransactionsToPaid: protectedProcedure
    .output(z.void())
    .mutation(async () => {
      await db.transaction.updateMany({
        where: { paid: false, pending: true },
        data: { paid: true },
      })
      return
    }),
})
