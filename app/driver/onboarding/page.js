'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { createClient } from '@/utils/supabase/client'
const { redirect } = require('next/navigation')

export default function DriverOnboarding() {
  const { data: session } = useSession()
  const [accountLink, setAccountLink] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!session) {
      redirect('/api/auth/signin')
    }
  }, [session])

  useEffect(() => {
    async function checkOnboardingStatus() {
      // Check if user already has a Stripe account
      const { data, error } = await supabase.schema('next_auth')
        .from('users')
        .select('stripe_connect_id, stripe_onboarding_complete')
        .eq('id', session.user.id)
        .single()
      
      if (data?.stripe_onboarding_complete) {
        // Already onboarded
        return
      }
      
      // If not onboarded or no account yet, create an account link
      const response = await fetch('/api/stripe/create-account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id }),
      })
      
      const result = await response.json()
      setAccountLink(result.url)
      setLoading(false)
    }
    
    if (session) {
      checkOnboardingStatus()
    }
  }, [session])

  return (
    <>
      {session && (
        <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Set Up Driver Payouts</h1>
        
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        ) : accountLink ? (
          <div className="space-y-6">
            <p>To receive payments for your rides, you need to connect your bank account through our secure payment provider, Stripe.</p>
            
            <a 
              href={accountLink}
              className="block w-full text-center py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Connect Your Bank Account
            </a>
            
            <div className="text-sm text-gray-600 bg-amber-50 p-4 rounded-lg">
              <p>You'll be redirected to Stripe to complete the verification process. This is required by financial regulations to ensure secure and legitimate transactions.</p>
            </div>
          </div>
        ) : (
          <div>Your account is already set up for payouts!</div>
        )}
      </div>
      )}
    </>
  )
}