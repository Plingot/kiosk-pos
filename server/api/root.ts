import { createTRPCRouter } from '@/server/api/trpc'
import { productsRouter } from '@/server/api/routers/products'
import { balancesRouter } from './routers/balances'
import { customersRouter } from './routers/customers'
import { transactionsRouter } from './routers/transactions'
import { categoriesRouter } from './routers/categories'
import { productRequestsRouter } from './routers/productRequests'
import { purchaseRouter } from './routers/purchase'

export const appRouter = createTRPCRouter({
  products: productsRouter,
  balances: balancesRouter,
  transactions: transactionsRouter,
  customers: customersRouter,
  categories: categoriesRouter,
  productRequests: productRequestsRouter,
  purchase: purchaseRouter,
})

export type AppRouter = typeof appRouter
