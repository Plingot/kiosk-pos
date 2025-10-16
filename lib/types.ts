import { z } from 'zod'

export type ProductVariant = z.infer<typeof ProductVariantSchema>

export const ProductVariantSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  stock: z.number(),
  purchasePrice: z.number().optional(),
  image: z.string().optional(),
})

export type Category = z.infer<typeof CategorySchema>

export const CategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  icon: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type Product = z.infer<typeof ProductSchema>

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  image: z.string(),
  stock: z.number(),
  purchasePrice: z.number().optional(),
  variants: z.array(ProductVariantSchema).nullable().optional(),
  relatedProductIds: z.array(z.string()).nullable().optional(),
  categoryId: z.string().optional(),
  category: CategorySchema.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type CartItem = z.infer<typeof CartItemSchema>

export const CartItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  image: z.string(),
  quantity: z.number(),
  variant: z
    .object({
      id: z.string(),
      name: z.string(),
      image: z.string().optional(),
    })
    .optional(),
})

export type Customer = z.infer<typeof CustomerSchema>

export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  balance: z.number(),
  invoiceBalance: z.number(),
  role: z.enum(['USER', 'ADMIN']),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type Transaction = z.infer<typeof TransactionSchema>

export const TransactionSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  items: z.array(CartItemSchema),
  total: z.number(),
  timestamp: z.date(),
  paid: z.boolean().optional(),
  pending: z.boolean().optional(),
})

export type ProductRequest = z.infer<typeof ProductRequestSchema>

export const ProductRequestSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  variantId: z.string().optional(),
  variantName: z.string().optional(),
  count: z.number(),
  lastRequested: z.date(),
  createdAt: z.date(),
})
