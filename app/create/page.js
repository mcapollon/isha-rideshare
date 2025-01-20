"use client"
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

// import { DirectionsService } from '@react-google-maps/api';
import MultistepForm from '@/components/createForm/multistep-form'

export default function Page() {

    const { data: session, status } = useSession()

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

                <section className='flex flex-col mx-4 md:mx-8 lg:mx-auto pt-4 md:pt-28 px-4 pb-4 max-w-7xl -mt-24 bg-white drop-shadow-md rounded-lg'>
                    <MultistepForm />
                </section>
            </div>
        )
    }
}