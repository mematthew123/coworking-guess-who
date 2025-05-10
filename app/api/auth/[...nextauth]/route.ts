import NextAuth from 'next-auth'
import AppleProvider from 'next-auth/providers/apple'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'

export default NextAuth({
  providers: [
    // OAuth authentication providers...
    AppleProvider({
      clientId: process.env.APPLE_ID || (() => { throw new Error('APPLE_ID is not defined') })(),
      clientSecret: process.env.APPLE_SECRET || (() => { throw new Error('APPLE_SECRET is not defined') })()
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID || (() => { throw new Error('FACEBOOK_ID is not defined') })(),
      clientSecret: process.env.FACEBOOK_SECRET || (() => { throw new Error('FACEBOOK_SECRET is not defined') })()
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || (() => { throw new Error('GOOGLE_ID is not defined') })(),
      clientSecret: process.env.GOOGLE_SECRET || (() => { throw new Error('GOOGLE_SECRET is not defined') })()
    }),
    // Passwordless / email sign in
    EmailProvider({
      server: process.env.MAIL_SERVER,
      from: 'NextAuth.js <no-reply@example.com>'
    }),
  ]
})