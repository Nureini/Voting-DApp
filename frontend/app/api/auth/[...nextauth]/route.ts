import { connectToDatabase } from '@/lib/mongodb/connectToDatabase'
import User from '@/lib/mongodb/models/User'
import NextAuth, {
  Account,
  AuthOptions,
  Session,
  User as UserType,
} from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import { JWT } from 'next-auth/jwt'

const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: {
          label: 'Email:',
          type: 'text',
          placeholder: 'Enter your email',
        },
        password: {
          label: 'Password:',
          type: 'password',
          placeholder: 'Enter your password',
        },
      },

      async authorize(credentials) {
        await connectToDatabase()

        const user = await User.findOne({ email: credentials?.email }).exec()

        if (user) {
          const comparePasswords = await bcrypt.compare(
            credentials?.password!,
            user.password
          )
          if (comparePasswords) {
            return user
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    jwt({
      token,
      account,
      user,
      session,
      trigger,
    }: {
      token: JWT
      account: Account
      user: UserType
      session: Session
      trigger: string
    }) {
      if (account) {
        token.id = user.id
        token.name = user.username
        token.email = user.email
      }

      if (trigger === 'update') {
        token.name = session?.newName
        token.email = session?.newEmail
      }

      return token
    },
    session({ session, token }: { session: Session; token: JWT }) {
      session.user.id = token.id as string
      session.user.name = token.name as string
      session.user.email = token.email
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}

const handler = NextAuth(authOptions as AuthOptions)

export { handler as GET, handler as POST }
