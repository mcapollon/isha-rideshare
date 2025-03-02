import { SupabaseAdapter } from "@auth/supabase-adapter"
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"

export const { handlers, auth, signIn, signOut, useSession } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google,
    Resend({
      // If your environment variable is named differently than default
   
      from: "no-reply@mckinsleyapollon.com",
      apiKey: process.env.RESEND_API_KEY,
      // Add this line to include the email in the request body
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
