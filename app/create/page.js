"use client"
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { CheckIcon } from '@heroicons/react/24/outline'
import { Radio, RadioGroup } from '@headlessui/react'
import { AddressAutofill } from '@mapbox/search-js-react'
import { format } from 'date-fns'

const steps = [
    {
        id: '1',
        name: 'Ride details',
    },
    {
        id: '2',
        name: 'Pricing',
    },
    { id: '3', name: 'Complete' }
]

const ishaYogaCenters = [
    {
        name: 'Isha Yoga Center, Coimbatore',
        address: 'XPGP+CMF, Isha Yoga Center Rd, Ikkaraibooluvampatti, Tamil Nadu 641114, India'
    },
    {
        name: 'Sadhguru Sannidhi, Bengaluru',
        address: 'FPP4+MH, Avalagurki, Karnataka 562101'
    },
    {
        name: 'Sadhguru Sanndhi, Chattarpur',
        address: 'Mandi Road, 4, Osho Dr, Gadaipur, New Delhi, Delhi 110030'
    },
    {
        name: 'Isha Institute of Inner-sciences (iii)',
        address: '951 Isha Lane, McMinnville, TN - 37110, USA'
    },
    {
        name: 'Isha Yoga Center, California',
        address: 'Isha Yoga Center LA, 7045 Farralone Ave. Canoga Park, CA 91303'
    }
]

const luggageOptions = [
    { size: 'No luggage' },
    { size: 'Small' },
    { size: 'Medium' },
    { size: 'Large' },
]

export default function Page() {
    const [previousStep, setPreviousStep] = useState(0)
    const [currentStep, setCurrentStep] = useState(0)
    const delta = currentStep - previousStep

    const {
        register,
        handleSubmit,
        reset,
        trigger,
        formState: { errors }
    } = useForm()

    const processForm = data => {
        console.log(data)
        reset()
    }

    const next = async () => {
        const fields = steps[currentStep].fields
        const output = await trigger(fields, { shouldFocus: true })

        if (!output) return

        if (currentStep < steps.length - 1) {
            if (currentStep === steps.length - 2) {
                await handleSubmit(processForm)()
            }
            setPreviousStep(currentStep)
            setCurrentStep(step => step + 1)
        }
    }

    const prev = () => {
        if (currentStep > 0) {
            setPreviousStep(currentStep)
            setCurrentStep(step => step - 1)
        }
    }

    const { data: session, status } = useSession()

    const [selected, setSelected] = useState(ishaYogaCenters[3])
    const [mem, setMem] = useState(luggageOptions[2])

    const currentDate = format(new Date(), 'yyyy-MM-ddTHH:mm')
    console.log(format(new Date(), 'yyyy-MM-ddTHH:mm'), 'CURRENT DATE')

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
                    {/* steps */}
                    <nav aria-label='Progress'>
                        <ol role="list" className="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0">
                            {steps.map((step, index) => (
                                <li key={step.name} className="relative md:flex md:flex-1">
                                    {currentStep > index ? (
                                        <a href={step.href} className="group flex w-full items-center">
                                            <span className="flex items-center px-6 py-4 text-sm font-medium">
                                                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
                                                    <CheckIcon aria-hidden="true" className="size-6 text-white" />
                                                </span>
                                                <span className="ml-4 text-sm font-bold text-black">{step.name}</span>
                                            </span>
                                        </a>
                                    ) : currentStep === index ? (
                                        <a href={step.href} aria-current="step" className="flex items-center px-6 py-4 text-sm font-medium">
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-indigo-600">
                                                <span className="text-indigo-600">{step.id}</span>
                                            </span>
                                            <span className="ml-4 text-sm font-medium text-black">{step.name}</span>
                                        </a>
                                    ) : (
                                        <div className='group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'>
                                            <span className='text-sm font-extrabold text-gray-500 transition-colors'>
                                                {step.id}
                                            </span>
                                            <span className='text-sm font-medium text-black'>{step.name}</span>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </nav>

                    {/* Form */}
                    <form className='mt-12 py-12' onSubmit={handleSubmit(processForm)}>
                        {currentStep === 0 && (
                            <motion.div
                                initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                                <h2 className='text-base font-semibold leading-7 text-gray-900'>
                                    Ride Details
                                </h2>
                                <p className='mt-1 text-sm leading-6 text-gray-600'>
                                    Provide your more information about the ride and other details
                                </p>
                                <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6'>
                                    <div className='sm:col-span-3'>
                                        <label
                                            htmlFor='startingPoint'
                                            className='block text-sm font-black leading-6 text-gray-900'
                                        >
                                            Starting Point
                                        </label>
                                        <div className='mt-2'>
                                            <AddressAutofill accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}>
                                                <input
                                                    type='text'
                                                    id='startingPoint'
                                                    autoComplete="address-line1"
                                                    {...register('startingPoint', { required: true })}
                                                    className='block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:outline-[#52422a] sm:text-sm sm:leading-6'
                                                />
                                            </AddressAutofill>
                                            {errors.startingPoint?.message && (
                                                <p className='mt-2 text-sm text-red-400'>
                                                    {errors.startingPoint.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className='sm:col-span-3'>
                                        <label
                                            htmlFor='ishaYogaCenter'
                                            className='block text-sm font-black leading-6 text-gray-900'
                                        >
                                            Destination - Isha Yoga Center
                                        </label>
                                        <div className='mt-2'>
                                            <select
                                                id='ishaYogaCenter'
                                                {...register('ishaYogaCenter', { required: true })}
                                                autoComplete='country-name'
                                                className='col-start-1 ring-1 shadow-sm row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-[#52422a] sm:text-sm/6'
                                            >
                                                {ishaYogaCenters.map((center, id) => (
                                                    <option key={id}>{center.name}</option>
                                                ))}
                                            </select>
                                            {errors.lastName?.message && (
                                                <p className='mt-2 text-sm text-red-400'>
                                                    {errors.lastName.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className='sm:col-span-3'>
                                        <label
                                            htmlFor='dateAndTime'
                                            className='block text-sm font-black leading-6 text-gray-900'
                                        >
                                            Departure time
                                        </label>
                                        <div className='mt-2'>
                                            <input
                                                type='datetime-local'
                                                id='dateAndTime'
                                                {...register('departureTime', { min: currentDate, required: true })}
                                                className='block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:outline-[#52422a] sm:text-sm sm:leading-6' />
                                            {errors.departureTime?.message && (
                                                <p className='mt-2 text-sm text-red-400'>
                                                    {errors.departureTime.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className='sm:col-span-3'>
                                        <label
                                            htmlFor='numberOfSeats'
                                            className='block text-sm font-black leading-6 text-gray-900'
                                        >
                                            Number of seats
                                        </label>
                                        <div className='mt-2'>
                                            <select
                                                id='numberOfSeats'
                                                {...register('numberOfSeats', { required: true })}
                                                autoComplete={1}
                                                className='col-start-1 ring-1 shadow-sm row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-[#52422a] sm:text-sm/6'
                                            >
                                                <option value={1}>1</option>
                                                <option value={2}>2</option>
                                                <option value={3}>3</option>
                                                <option value={4}>4</option>
                                                <option value={5}>5</option>
                                                <option value={6}>6</option>
                                                <option value={7}>7</option>
                                            </select>
                                            {errors.departureTime?.message && (
                                                <p className='mt-2 text-sm text-red-400'>
                                                    {errors.departureTime.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className='sm:col-span-3'>
                                        <label
                                            htmlFor='luggage'
                                            className='block text-sm font-black leading-6 text-gray-900'
                                        >
                                            Luggage
                                        </label>
                                        <fieldset>
                                            <div className="mt-6 space-y-6 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                                                {luggageOptions.map((luggageOption) => (
                                                    <div key={luggageOption.size} className="flex items-center">
                                                        <input
                                                            id={luggageOption.size}
                                                            name="notification-method"
                                                            type="radio"
                                                            className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
                                                        />
                                                        <label htmlFor={luggageOption.size} className="ml-3 block text-sm/6 font-medium text-gray-900">
                                                            {luggageOption.size}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </fieldset>
                                        {errors.departureTime?.message && (
                                            <p className='mt-2 text-sm text-red-400'>
                                                {errors.departureTime.message}
                                            </p>
                                        )}

                                    </div>

                                    <div className='sm:col-span-3'>
                                        <label
                                            htmlFor='description'
                                            className='block text-sm font-black leading-6 text-gray-900'
                                        >
                                            Description
                                        </label>
                                        <div className='mt-2'>
                                            <textarea
                                                id="description"
                                                {...register('description', {required: true})}
                                                name="description"
                                                placeholder='Provide as much description as possible about the pickup and dropoff locations for your passengers.'
                                                rows={4}
                                                className="block w-full rounded-md border drop-shadow-sm border-gray-300 bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                                defaultValue={''}
                                            />
                                            {errors.description?.message && (
                                                <p className='mt-2 text-sm text-red-400'>
                                                    {errors.description.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 1 && (
                            <motion.div
                                initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                                <h2 className='text-base font-semibold leading-7 text-gray-900'>
                                    Pricing
                                </h2>
                                
                                <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6'>
                                    <div className='sm:col-span-3'>
                                        <label
                                            htmlFor='country'
                                            className='block text-sm font-medium leading-6 text-gray-900'
                                        >
                                            Country
                                        </label>
                                        <div className='mt-2'>
                                            <select
                                                id='country'
                                                {...register('country')}
                                                autoComplete='country-name'
                                                className='block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:max-w-xs sm:text-sm sm:leading-6'
                                            >
                                                <option>United States</option>
                                                <option>Canada</option>
                                                <option>Mexico</option>
                                            </select>
                                            {errors.country?.message && (
                                                <p className='mt-2 text-sm text-red-400'>
                                                    {errors.country.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className='col-span-full'>
                                        <label
                                            htmlFor='street'
                                            className='block text-sm font-medium leading-6 text-gray-900'
                                        >
                                            Street address
                                        </label>
                                        <div className='mt-2'>
                                            <input
                                                type='text'
                                                id='street'
                                                {...register('street')}
                                                autoComplete='street-address'
                                                className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6'
                                            />
                                            {errors.street?.message && (
                                                <p className='mt-2 text-sm text-red-400'>
                                                    {errors.street.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className='sm:col-span-2 sm:col-start-1'>
                                        <label
                                            htmlFor='city'
                                            className='block text-sm font-medium leading-6 text-gray-900'
                                        >
                                            City
                                        </label>
                                        <div className='mt-2'>
                                            <input
                                                type='text'
                                                id='city'
                                                {...register('city')}
                                                autoComplete='address-level2'
                                                className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6'
                                            />
                                            {errors.city?.message && (
                                                <p className='mt-2 text-sm text-red-400'>
                                                    {errors.city.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className='sm:col-span-2'>
                                        <label
                                            htmlFor='state'
                                            className='block text-sm font-medium leading-6 text-gray-900'
                                        >
                                            State / Province
                                        </label>
                                        <div className='mt-2'>
                                            <input
                                                type='text'
                                                id='state'
                                                {...register('state')}
                                                autoComplete='address-level1'
                                                className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6'
                                            />
                                            {errors.state?.message && (
                                                <p className='mt-2 text-sm text-red-400'>
                                                    {errors.state.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className='sm:col-span-2'>
                                        <label
                                            htmlFor='zip'
                                            className='block text-sm font-medium leading-6 text-gray-900'
                                        >
                                            ZIP / Postal code
                                        </label>
                                        <div className='mt-2'>
                                            <input
                                                type='text'
                                                id='zip'
                                                {...register('zip')}
                                                autoComplete='postal-code'
                                                className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6'
                                            />
                                            {errors.zip?.message && (
                                                <p className='mt-2 text-sm text-red-400'>
                                                    {errors.zip.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <>
                                <h2 className='text-base font-semibold leading-7 text-gray-900'>
                                    Complete
                                </h2>
                                <p className='mt-1 text-sm leading-6 text-gray-600'>
                                    Thank you for your submission.
                                </p>
                            </>
                        )}
                    </form>

                    {/* Navigation */}
                    <div className='mt-8 pt-5'>
                        <div className='flex justify-between'>
                            <button
                                type='submit'
                                onClick={prev}
                                disabled={currentStep === 0}
                                className='rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    strokeWidth='1.5'
                                    stroke='currentColor'
                                    className='h-6 w-6'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        d='M15.75 19.5L8.25 12l7.5-7.5'
                                    />
                                </svg>
                            </button>
                            <button
                                type='submit'
                                onClick={next}
                                disabled={currentStep === steps.length - 1}
                                className='rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    strokeWidth='1.5'
                                    stroke='currentColor'
                                    className='h-6 w-6'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        d='M8.25 4.5l7.5 7.5-7.5 7.5'
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        )
    }
}