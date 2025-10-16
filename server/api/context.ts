import { db } from '@/server/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function createContext() {
  const session = await getServerSession(authOptions)

  return { db, session }
}

export type Context = Awaited<ReturnType<typeof createContext>>
