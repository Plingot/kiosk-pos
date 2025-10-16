import GoogleProvider from 'next-auth/providers/google'
import NextAuth, { type NextAuthOptions } from 'next-auth'
import { db } from '@/server/db'

export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session }) {
      return session
    },
    signIn: async ({ account, profile }) => {
      if (account?.provider !== 'google') {
        return Promise.resolve(false)
      }

      try {
        const customer = await db.customer.findFirst({
          where: { email: profile?.email as string },
        })

        if (customer?.role === 'ADMIN') {
          return Promise.resolve(true)
        }
      } catch (error) {
        console.error('Error fetching customer', error)
        return Promise.resolve(false)
      }

      return Promise.resolve(false)
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
}

const handler = NextAuth({
  ...authOptions,
})

export { handler as GET, handler as POST }
