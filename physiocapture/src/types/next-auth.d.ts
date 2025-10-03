import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      clinicId: string
      role: UserRole
      crm?: string | null
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    clinicId: string
    role: UserRole
    crm?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    clinicId: string
    role: UserRole
    crm?: string | null
  }
}