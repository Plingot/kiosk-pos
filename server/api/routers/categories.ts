import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'
import { z } from 'zod'
import { db } from '@/server/db'
import { CategorySchema } from '@/lib/types'

export const categoriesRouter = createTRPCRouter({
  getCategories: publicProcedure
    .output(z.array(CategorySchema))
    .query(async () => {
      const categories = await db.category.findMany()
      return categories.map((category) => ({
        id: category.id,
        title: category.title,
        icon: category.icon,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      }))
    }),
  getCategory: publicProcedure
    .output(CategorySchema.nullable())
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const category = await db.category.findUnique({
        where: { id: input.id },
      })
      return category
    }),
  createCategory: protectedProcedure
    .input(
      z.object({
        category: CategorySchema.omit({
          id: true,
          createdAt: true,
          updatedAt: true,
        }),
      }),
    )
    .output(z.void())
    .mutation(async ({ input }) => {
      await db.category.create({ data: input.category })
      return
    }),
  updateCategory: protectedProcedure
    .input(z.object({ category: CategorySchema }))
    .output(z.void())
    .mutation(async ({ input }) => {
      await db.category.update({
        where: { id: input.category.id },
        data: input.category,
      })
      return
    }),
  deleteCategory: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .mutation(async ({ input }) => {
      await db.category.delete({ where: { id: input.id } })
      return
    }),
})
