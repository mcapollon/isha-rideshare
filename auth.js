import { SupabaseAdapter } from "@auth/supabase-adapter"
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import {sendVerificationRequest} from "./lib/authSendRequest"
import Resend from "next-auth/providers/resend"

export const { handlers, auth, signIn, signOut, useSession } = NextAuth({
  providers: [
    Google,
    Facebook,
    Resend({
      sendVerificationRequest,
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }),
  pages: {
    newUser: '/auth/new-user',
    signIn: '/auth/sign-in',
  },
  trustHost: true,
  callbacks: {
    session: ({ session, user, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: user?.id || token?.sub, // Make sure user ID is included in the session
      },
    }),
  }
})
