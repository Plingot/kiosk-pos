import { publicProcedure, createTRPCRouter, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { ProductSchema } from '@/lib/types'
import { db } from '@/server/db'

export const productsRouter = createTRPCRouter({
  getProducts: publicProcedure
    .output(z.array(ProductSchema))
    .query(async () => {
      const products = await db.product.findMany({
        orderBy: { createdAt: 'asc' },
        include: {
          variants: true,
          category: true,
        },
      })
      return products.map((product) => ({
        id: product.id ?? '',
        name: product.name ?? '',
        price: product.price ?? 0,
        image: product.image ?? '',
        stock: product.stock ?? 0,
        purchasePrice: product.purchasePrice ?? undefined,
        variants:
          product.variants?.map((variant) => ({
            ...variant,
            image: variant.image ?? undefined,
          })) ?? undefined,
        relatedProductIds: product.relatedProductIds ?? undefined,
        categoryId: product.categoryId ?? undefined,
        category: product.category ?? undefined,
        createdAt: product.createdAt ?? undefined,
        updatedAt: product.updatedAt ?? undefined,
      }))
    }),
  getProduct: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(ProductSchema.nullable())
    .query(async ({ input }) => {
      const product = await db.product.findUnique({
        where: { id: input.id },
        include: {
          variants: true,
          category: true,
        },
      })
      if (!product) {
        return null
      }
      return {
        id: product.id ?? '',
        name: product.name ?? '',
        price: product.price ?? 0,
        image: product.image ?? '',
        stock: product.stock ?? 0,
        purchasePrice: product.purchasePrice ?? undefined,
        variants:
          product.variants?.map((variant) => ({
            ...variant,
            image: variant.image ?? undefined,
          })) ?? undefined,
        relatedProductIds: product.relatedProductIds ?? undefined,
        categoryId: product.categoryId ?? undefined,
        category: product.category ?? undefined,
        createdAt: product.createdAt ?? undefined,
        updatedAt: product.updatedAt ?? undefined,
      }
    }),
  createProduct: protectedProcedure
    .input(
      ProductSchema.omit({
        id: true,
        category: true,
        createdAt: true,
        updatedAt: true,
      }),
    )
    .output(z.string())
    .mutation(async ({ input }) => {
      const { variants, categoryId, relatedProductIds, ...productData } = input

      const product = await db.product.create({
        data: {
          ...productData,
          ...(categoryId && { categoryId }),
          ...(relatedProductIds && { relatedProductIds }),
          variants: {
            create:
              variants?.map((v) => ({
                name: v.name,
                price: v.price,
                stock: v.stock,
                purchasePrice: v.purchasePrice ?? 0,
                image: v.image ?? null,
              })) ?? [],
          },
        },
      })
      return product.id
    }),
  updateProduct: protectedProcedure
    .input(ProductSchema)
    .output(z.void())
    .mutation(async ({ input }) => {
      const existingVariants = await db.productVariant.findMany({
        where: { productId: input.id },
      })

      const inputVariants = input.variants ?? []

      const existingVariantIds = existingVariants.map((v) => v.id)

      const toUpdate = inputVariants.filter(
        (v) => v.id && existingVariantIds.includes(v.id),
      )
      const toCreate = inputVariants.filter(
        (v) => !v.id || !existingVariantIds.includes(v.id),
      )
      const inputIds = toUpdate.map((v) => v.id)
      const toDelete = existingVariants.filter((v) => !inputIds.includes(v.id))

      await db.$transaction([
        ...toUpdate.map((v) =>
          db.productVariant.update({
            where: { id: v.id! },
            data: {
              name: v.name,
              price: v.price,
              stock: v.stock,
              purchasePrice: v.purchasePrice,
              image: v.image,
            },
          }),
        ),

        ...toCreate.map((v) =>
          db.productVariant.create({
            data: {
              name: v.name,
              price: v.price,
              stock: v.stock,
              purchasePrice: v.purchasePrice ?? 0,
              image: v.image ?? null,
              productId: input.id,
            },
          }),
        ),

        ...toDelete.map((v) =>
          db.productVariant.delete({
            where: { id: v.id },
          }),
        ),

        db.product.update({
          where: { id: input.id },
          data: {
            name: input.name,
            price: input.price,
            stock: input.stock,
            purchasePrice: input.purchasePrice,
            image: input.image,
            categoryId: input.categoryId,
            relatedProductIds: input.relatedProductIds ?? [],
          },
        }),
      ])
    }),
  deleteProduct: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .mutation(async ({ input }) => {
      await db.$transaction([
        db.productVariant.deleteMany({ where: { productId: input.id } }),
        db.product.delete({ where: { id: input.id } }),
      ])
      return
    }),
})
