'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { verifyDriverOnboarding } from '@/utils/driverVerification'
import { redirect } from 'next/navigation'
import MultistepForm from '@/components/createForm/multistep-form'
import { createClient } from "@/utils/supabase/client"

export default function Page() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isCheckingDriver, setIsCheckingDriver] = useState(true)
  const [isCheckingProfile, setIsCheckingProfile] = useState(true)
  const supabase = createClient()
  
  // Check if user profile is complete
  useEffect(() => {
    async function checkUserProfile() {
      if (!session?.user?.id) return
      
      const { data, error } = await supabase.schema('next_auth')
        .from('users')
        .select('phone_number, location, dateOfBirth')
        .eq('id', session.user?.id)
        .single()
      
      if (error) {
        console.error('Error checking user profile:', error)
      }
      
      if (!data?.phone_number || !data?.location || !data?.dateOfBirth) {
        // Profile is incomplete, redirect to new-user page
        router.push('/auth/new-user')
      } else {
        setIsCheckingProfile(false)
      }
    }
    
    checkUserProfile()
  }, [session, router])
  
  // Verify driver status before allowing ride creation
  useEffect(() => {
    async function checkDriverStatus() {
      if (!session?.user?.id || isCheckingProfile) return
      
      const { isComplete } = await verifyDriverOnboarding(session.user.id)
      
      if (!isComplete) {
        // Redirect to onboarding if not complete
        router.push('/driver/onboarding')
      } else {
        setIsCheckingDriver(false)
      }
    }
    
    if (!isCheckingProfile) {
      checkDriverStatus()
    }
  }, [session, router, isCheckingProfile])
  
  if (!session || !session?.user) {
    redirect('/auth/sign-in')
  }
  
  if (isCheckingProfile || isCheckingDriver) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    )
  }
  
  return (
    <div className='pb-4'>
      <div className='bg-[#d9cebc] min-h-52'>
        <div className='mx-4 md:mx-8 lg:mx-auto max-w-7xl pt-14'>
          <h1 className='text-4xl font-bold text-white/90'>Create a ride</h1>
        </div>
      </div>

      <section className='flex flex-col mx-4 md:mx-8 lg:mx-auto pt-4 px-4 pb-4 max-w-7xl -mt-24 bg-white drop-shadow-md rounded-lg'>
        <MultistepForm />
      </section>
    </div>
  )
}