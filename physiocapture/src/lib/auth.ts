import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            clinic: true
          }
        })

        if (!user) {
          return null
        }

        // Verificar se o usuário está ativo
        if (!user.isActive) {
          throw new Error('Usuário inativo. Entre em contato com o administrador.')
        }

        // Verificar se a clínica está ativa
        if (!user.clinic.isActive) {
          throw new Error('Clínica inativa. Entre em contato com o suporte.')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          clinicId: user.clinicId,
          role: user.role,
          crm: user.crm,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.clinicId = user.clinicId
        token.role = user.role
        token.crm = user.crm
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.clinicId = token.clinicId as string
        session.user.role = token.role
        session.user.crm = token.crm as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
}