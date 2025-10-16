import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'
import { z } from 'zod'
import { db } from '@/server/db'
import { CustomerSchema } from '@/lib/types'
import {
  calculateCustomerBalance,
  calculateCustomerBalancePending,
} from './balances'

export const customersRouter = createTRPCRouter({
  getCustomers: publicProcedure
    .output(z.array(CustomerSchema))
    .query(async () => {
      const customers = await db.customer.findMany()
      const customersWithBalance = []
      for (const customer of customers) {
        const balance = await calculateCustomerBalance(customer.id)
        const invoiceBalance = await calculateCustomerBalancePending(
          customer.id,
        )
        customersWithBalance.push({
          id: customer.id,
          name: customer.name,
          email: customer.email ?? undefined,
          balance: balance,
          invoiceBalance: invoiceBalance,
          role: customer.role ?? 'USER',
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt,
        })
      }
      return customersWithBalance
    }),
  createCustomer: protectedProcedure
    .input(
      z.object({
        customer: CustomerSchema.omit({
          id: true,
          balance: true,
          invoiceBalance: true,
        }),
      }),
    )
    .output(z.void())
    .mutation(async ({ input }) => {
      await db.customer.create({ data: input.customer })
      return
    }),
  updateCustomer: protectedProcedure
    .input(
      z.object({
        customer: CustomerSchema.omit({ balance: true, invoiceBalance: true }),
      }),
    )
    .output(z.void())
    .mutation(async ({ input }) => {
      await db.customer.update({
        where: { id: input.customer.id },
        data: input.customer,
      })
      return
    }),
  deleteCustomer: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .mutation(async ({ input }) => {
      await db.customer.delete({ where: { id: input.id } })
      return
    }),
})
