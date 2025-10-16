import { createTRPCRouter, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { db } from '@/server/db'

export const calculateCustomerBalance = async (customerId: string) => {
  const transactions = await db.transaction.findMany({
    where: { customerId, pending: false, paid: false },
  })
  return transactions.reduce((sum, transaction) => sum + transaction.total, 0)
}

export const calculateCustomerBalancePending = async (customerId: string) => {
  const transactions = await db.transaction.findMany({
    where: {
      customerId: customerId,
      pending: true,
      paid: false,
    },
  })
  return (
    transactions.reduce((sum, transaction) => sum + transaction.total, 0) ?? 0
  )
}

export const balancesRouter = createTRPCRouter({
  calculateCustomerBalancePending: protectedProcedure
    .input(z.object({ customerId: z.string() }))
    .output(z.number())
    .query(async ({ input }) => {
      return await calculateCustomerBalancePending(input.customerId)
    }),
})
