"use client"
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { createClient } from "@/utils/supabase/client"
import { useEffect } from 'react'

// import { DirectionsService } from '@react-google-maps/api';
import MultistepForm from '@/components/createForm/multistep-form'

export default function Page() {

    const { data: session, status } = useSession()

    const supabase = createClient()

    useEffect(() => {
        checkProfile()
    }, [session])

    const checkProfile = async () => {
        const { data, error } = await supabase.schema('next_auth')
            .from('users')
            .select('phone_number, location, dateOfBirth, name')
            .eq('id', session.user?.id)
            .single()

        if (!data?.phone_number || !data?.location || !data?.dateOfBirth || !data?.name) {
            // If profile is incomplete, redirect to new-user page to complete profile
            redirect('/auth/new-user')
        }

    }

    if (!session || !session?.user) {
        redirect("/api/auth/signin")
    } else {
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
}