import { SupabaseAdapter } from "@auth/supabase-adapter"
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"
import Facebook from "next-auth/providers/facebook"

export const { handlers, auth, signIn, signOut, useSession } = NextAuth({
  providers: [
    Google,
    Facebook,
    Resend({ 
      from: "no-reply@mckinsleyapollon.com",
      apiKey: process.env.RESEND_API_KEY,
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
  trustHost: true
})
