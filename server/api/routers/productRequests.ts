import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'
import { z } from 'zod'
import { db } from '@/server/db'
import { ProductRequestSchema } from '@/lib/types'

export const productRequestsRouter = createTRPCRouter({
  getProductRequests: protectedProcedure
    .output(z.array(ProductRequestSchema))
    .query(async () => {
      const productRequests = await db.productRequest.findMany({
        orderBy: { createdAt: 'asc' },
      })
      return productRequests.map((productRequest) => ({
        id: productRequest.id,
        productId: productRequest.productId,
        productName: productRequest.productName,
        variantId: productRequest.variantId ?? undefined,
        variantName: productRequest.variantName ?? undefined,
        count: productRequest.count,
        lastRequested: productRequest.lastRequested ?? undefined,
        createdAt: productRequest.createdAt ?? undefined,
      }))
    }),
  requestProduct: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        productName: z.string(),
        variantId: z.string().optional(),
        variantName: z.string().optional(),
      }),
    )
    .output(z.void())
    .mutation(async ({ input }) => {
      const alreadyExists = await db.productRequest.findFirst({
        where: { productId: input.productId, variantId: input.variantId },
      })
      if (alreadyExists) {
        await db.productRequest.update({
          where: { id: alreadyExists.id },
          data: { count: alreadyExists.count + 1, lastRequested: new Date() },
        })
        return
      }
      await db.productRequest.create({
        data: { ...input, count: 1, lastRequested: new Date() },
      })
      return
    }),
  deleteProductRequest: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .mutation(async ({ input }) => {
      await db.productRequest.delete({ where: { id: input.id } })
      return
    }),
  clearAllProductRequests: protectedProcedure
    .output(z.void())
    .mutation(async () => {
      await db.productRequest.deleteMany()
      return
    }),
})
