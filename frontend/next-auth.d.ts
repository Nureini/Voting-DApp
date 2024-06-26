import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    newName: string
    newEmail: string
    user: {
      id: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    username: string
  }
}
