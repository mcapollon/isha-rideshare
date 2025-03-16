'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Clock } from 'lucide-react'
import { redirect } from 'next/navigation'

export default function OnboardingSuccess() {
  const { data: session } = useSession()
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!session?.user?.id) return

    async function verifyAndUpdateAccount() {
      try {
        // Verify with Stripe that the account is properly set up
        const response = await fetch('/api/stripe/verify-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session.user.id
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Failed to verify account status')
        }

        if (result.success) {
          // Update the user record to mark onboarding as complete
          const { error } = await supabase.schema('next_auth')
            .from('users')
            .update({ 
              stripe_onboarding_complete: true 
            })
            .eq('id', session.user.id)

          if (error) throw new Error('Failed to update account status')
          
          setStatus('success')
        } else {
          // Onboarding not complete
          setStatus('error')
          setMessage(result.message || 'Onboarding is not complete. Please try again.')
        }
      } catch (error) {
        console.error('Error verifying account:', error)
        setStatus('error')
        setMessage(error.message || 'Something went wrong. Please try again.')
      }
    }

    verifyAndUpdateAccount()
  }, [session])

  if (!session) {
    redirect('/auth/sign-in')
  }

    useEffect(() => {
      if (!session) {
        redirect('/auth/sign-in')
      }
    }, [session])

  return (
    <div className="max-w-3xl mx-auto p-6">
      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
          <p className="text-gray-600">Verifying your account...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-red-700 mb-2">Verification Failed</h2>
            <p className="text-gray-700 mb-4">{message}</p>
            <Link
              href="/driver/onboarding"
              className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Return to Onboarding
            </Link>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center py-8">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle size={48} className="text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Onboarding Complete!</h1>
          <p className="text-gray-600 mb-8">Your account has been successfully set up to receive payments.</p>
          
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-lg mb-4">What happens next?</h2>
            
            <ul className="space-y-4">
              <li className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    1
                  </div>
                </div>
                <div>
                  <p className="font-medium">Create rides</p>
                  <p className="text-gray-600">Post your rides to the platform so passengers can book seats.</p>
                </div>
              </li>
              
              <li className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    2
                  </div>
                </div>
                <div>
                  <p className="font-medium">Accept bookings</p>
                  <p className="text-gray-600">Passengers will book and pay for seats on your rides.</p>
                </div>
              </li>
              
              <li className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    3
                  </div>
                </div>
                <div>
                  <p className="font-medium">Get paid automatically</p>
                  <p className="text-gray-600">Payments will be sent to your connected bank account 3 days after each completed ride.</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/create" 
              className="px-5 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center justify-center"
            >
              Create a Ride <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            
            <Link 
              href="/account?tab=payouts" 
              className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
            >
              View Payouts Dashboard <Clock className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}