'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

function Page() {
    const { data: session } = useSession()
    const [isMobile, setIsMobile] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [selectedMenuItem, setSelectedMenuItem] = useState('Profile & Personal Information')

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768)
        }

        handleResize()
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    useEffect(() => {
        setDropdownOpen(false)
    }, [selectedMenuItem])

    useEffect(() => {
        if (!session) {
            redirect("/api/auth/signin")
        }
    }, [session])

    if (!session || !session?.user) {
        redirect("/api/auth/signin")
    } else {
        return (
            <div className='lg:mx-auto max-w-7xl px-4 mx-auto py-8'>
                <form>
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
                            {/* Side Bar Nav */}
                            <div className='w-full'>
                                {isMobile ? (
                                    <div className="relative">
                                        <button
                                            type="button"
                                            className="w-full rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50"
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                        >
                                            Menu
                                        </button>
                                        {dropdownOpen && (
                                            <ul className="absolute mt-2 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                                                <li onClick={(e) => setSelectedMenuItem('Profile & Personal Information')} className='rounded-md px-3.5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50'>Profile & Personal Information</li>
                                                <li onClick={(e) => setSelectedMenuItem('Payments & Payouts')} className='rounded-md px-3.5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50'>Payments & Payouts</li>
                                                <li onClick={(e) => setSelectedMenuItem('Rides & Bookings')} className='rounded-md px-3.5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50'>Rides & Bookings</li>
                                                <li onClick={(e) => setSelectedMenuItem('Security')} className='rounded-md px-3.5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50'>Security</li>
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <ul className='gap-y-4 flex flex-col w-full'>
                                        <li onClick={(e) => setSelectedMenuItem('Profile & Personal Information')} className='rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50'>Profile & Personal Information</li>
                                        <li onClick={(e) => setSelectedMenuItem('Payments & Payouts')} className='rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50'>Payments & Payouts</li>
                                        <li onClick={(e) => setSelectedMenuItem('Rides & Bookings')} className='rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50'>Rides & Bookings</li>
                                        <li onClick={(e) => setSelectedMenuItem('Security')} className='rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50'>Security</li>
                                    </ul>
                                )}
                            </div>

                            {selectedMenuItem == "Profile & Personal Information" && (
                                <>
                                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                                        <div className="col-span-3">
                                            <label htmlFor="firstName" className="block text-sm/6 font-bold text-gray-900">
                                                First Name
                                            </label>
                                            <div className="mt-2">
                                                <Input
                                                    id="firstName"
                                                    name="firstName"
                                                    type="text"
                                                    placeholder="John"
                                                />
                                            </div>
                                        </div>

                                        <div className="col-span-3">
                                            <label htmlFor="lastName" className="block text-sm/6 font-bold text-gray-900">
                                                Last Name
                                            </label>
                                            <div className="mt-2">
                                                <Input
                                                    id="lastName"
                                                    name="lastName"
                                                    type="text"
                                                    placeholder="Doe"
                                                />
                                            </div>
                                        </div>

                                        <div className="col-span-full">
                                            <label htmlFor="about" className="block text-sm/6 font-medium text-gray-900">
                                                Description
                                            </label>
                                            <div className="mt-2">
                                                <Textarea
                                                    id="about"
                                                    name="about"
                                                    rows={3}
                                                    defaultValue={''}
                                                    placeholder='Write a few sentences about yourself.'
                                                />
                                            </div>
                                        </div>

                                        <div className="col-span-full">
                                            <label htmlFor="photo" className="block text-sm/6 font-medium text-gray-900">
                                                Photo
                                            </label>
                                            <div className="mt-2 flex items-center gap-x-3">
                                                <UserCircleIcon aria-hidden="true" className="size-12 text-gray-300" />
                                                <button
                                                    type="button"
                                                    className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {selectedMenuItem == "Payments & Payouts" && (
                                <h1>Payments & Payouts</h1>
                            )}

                            {selectedMenuItem == "Rides & Bookings" && (
                                <h1>Rides & Bookings</h1>
                            )}

                            {selectedMenuItem == "Security" && (
                                <h1>Security</h1>
                            )}
                            
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}

export default Page