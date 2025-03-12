'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { verifyDriverOnboarding } from '@/utils/driverVerification'
import { redirect } from 'next/navigation'
import MultistepForm from '@/components/createForm/multistep-form'

export default function Page() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isCheckingDriver, setIsCheckingDriver] = useState(true)
  
  // Verify driver status before allowing ride creation
  useEffect(() => {
    async function checkDriverStatus() {
      if (!session?.user?.id) return
      
      const { isComplete } = await verifyDriverOnboarding(session.user.id)
      
      if (!isComplete) {
        // Redirect to onboarding if not complete
        router.push('/driver/onboarding')
      } else {
        setIsCheckingDriver(false)
      }
    }
    
    checkDriverStatus()
  }, [session, router])
  
  if (!session || !session?.user) {
    redirect('/auth/sign-in')
  }
  
  if (isCheckingDriver) {
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