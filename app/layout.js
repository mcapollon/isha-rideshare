import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { auth } from "@/auth"
import { SessionProvider } from "next-auth/react";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sangha Rides",
  description: "Sangha Rides connects travelers heading to Isha Yoga events with nearby drivers and riders. Find or offer rides, reduce travel costs, and journey with like-minded seekers.",
};

export default async function RootLayout({ children }) {

  const session = await auth()

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <SessionProvider session={session}>
          <Navbar />
          {children}
          <footer className="w-full border-t bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
              <div className="mb-2 md:mb-0">&copy; {new Date().getFullYear()} Sangha Rides. All rights reserved.</div>
              <div className="flex items-center space-x-2">
                <a href="/terms-of-service" className="hover:text-amber-600">Terms of Service</a>
                <span className="text-gray-400" aria-hidden="true">&middot;</span>
                <a href="/privacy-policy" className="hover:text-amber-600">Privacy Policy</a>
                <span className="text-gray-400" aria-hidden="true">&middot;</span>
                <a href="/bug-report" className="hover:text-amber-600">Report a Bug</a>
              </div>
            </div>
          </footer>
          <SpeedInsights />
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
