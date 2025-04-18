import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { auth } from "@/auth"
import { SessionProvider } from "next-auth/react";
import { SpeedInsights } from "@vercel/speed-insights/next"

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
          <SpeedInsights />
        </SessionProvider>

      </body>
    </html>
  );
}
