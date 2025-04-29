'use client'

import { useEffect, useState } from 'react'
import { useForm, FormProvider, useFormContext } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import RideDetailsStep from './steps/ride-details'
import PricingStep from './steps/pricing'
import ReviewStep from './steps/review'
import RideCreationSuccessStep from './steps/creation-success'
import { Stepper } from './stepper'
import { createClient } from '@/utils/supabase/client'
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import useFormStore from './formStore'
import { useSession } from 'next-auth/react'
import {redirect} from 'next/navigation'

// const steps = ['Ride Details', 'Pricing', 'Contact Details', 'Review'];
const steps = ['Ride Details', 'Pricing', 'Review'];

export default function MultistepForm() {
    const [step, setStep] = useState(1)
    const [vehicles, setVehicles] = useState([])
    const formStoreRouteStatus = useFormStore((state) => state.formStoreRouteStatus)
    const formStoreStartingCoordinates = useFormStore((state) => state.formStoreStartingCoordinates)
    const formStoreRideDuration = useFormStore((state) => state.formStoreRideDuration)
    const {data: session} = useSession()

    // Fetch vehicles for the current user
    useEffect(() => {
        async function fetchVehicles() {
            if (!session?.user?.id) return;
            const supabase = createClient();
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });
            if (!error && data) setVehicles(data);
        }
        fetchVehicles();
    }, [session]);

    const schema = yup
        .object({
            startingPointAddress: yup.string().required('Starting Point is required')
            .test('routeStatus', 'There is no valid route between your starting point and the selected isha yoga center',() => {
                if (formStoreRouteStatus === 'OK') {
                    return true
                } else return false
            }),
            ishaYogaCenter: yup.string().required('Choosing an Isha Yoga Center is required')
            .test('routeStatus', 'There is no valid route between the your starting point and the selected Isha Yoga Center',() => {                
                if (formStoreRouteStatus === 'OK') {
                    return true
                } else return false
            }),
            departure: yup.date().required('Departure date & time is required'),
            seats: yup.string().required('Please choose the amount of available seats for your trip'),
            luggage: yup.string().required('Please choose luggage'),
            description: yup.string().required('Description is required'),
        })
        .required()

    const methods = useForm({
        mode: 'onBlur',
        defaultValues: {
            startingPointAddress: '',
            startingCity: '',
            ishaYogaCenter: '',
            departure: null,
            seats: '',
            luggage: '',
            description: '',
            rideDistanceMeters: null,
            vehicleId: '',
        },
        resolver: yupResolver(schema),
    })

    const { setValue, getValues, setError, clearErrors } = methods

    const nextStep = (data) => {
        //console.log("Form data:", methods.getValues())
        methods.trigger().then((isValid) => {
            if (step > 1) {
                if (isValid) {
                    setStep(step + 1)
                }
            } else if (isValid) {
                setStep(step + 1)
            }
        })

    }
    const prevStep = () => setStep(step - 1)

    const onSubmit = async (data) => {
        try {
            const supabase = createClient()
            // Format departure as local time string (YYYY-MM-DDTHH:mm)
            let departureLocal = null;
            if (data.departure instanceof Date && !isNaN(data.departure)) {
                const pad = n => n.toString().padStart(2, '0');
                departureLocal = `${data.departure.getFullYear()}-${pad(data.departure.getMonth()+1)}-${pad(data.departure.getDate())}T${pad(data.departure.getHours())}:${pad(data.departure.getMinutes())}`;
            }
            // First get the driver's Stripe Connect ID
            const { data: userData, error: userError } = await supabase.schema('next_auth')
                .from('users')
                .select('stripe_connect_id')
                .eq('id', session.user.id)
                .single()
                
            if (userError) {
                console.error("Error fetching user stripe data:", userError)
                // setFormError("Unable to create ride. Please try again later.")
                return
            }
            
            if (!userData?.stripe_connect_id) {
                console.error("Driver has no Stripe Connect account")
                redirect('/driver/onboarding')
                return
            }
            
            // Then create the ride with the driver's Stripe Connect ID
            const { error } = await supabase
                .from('rides')
                .insert({
                    startingPointAddress: data.startingPointAddress,
                    startingPointCoordinates: formStoreStartingCoordinates,
                    startingCity: data.startingCity,
                    ishaYogaCenter: data.ishaYogaCenter,
                    departure: departureLocal,
                    seats: data.seats,
                    luggage: data.luggage,
                    description: data.description,
                    rideDistanceMeters: data.rideDistanceMeters,
                    rideDuration: formStoreRideDuration,
                    pricePerSeat: data.pricePerSeat,
                    createdByUser: session.user.id,
                    seatsRemaining: data.seats,
                    driver_stripe_connect_id: userData.stripe_connect_id,
                    payInCash: data.payInCash,
                    currency: data.currency,
                    vehicle_id: data.vehicleId ? data.vehicleId : null,
                })
                
            if (error) {
                console.error("Form error:", error)
                // setFormError("Failed to create ride. Please try again.")
                return
            }
            
            setStep(4)
        } catch (err) {
            console.error("Unexpected error:", err)
            // setFormError("An unexpected error occurred. Please try again.")
        }
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return <RideDetailsStep vehicles={vehicles} />
            case 2:
                return <PricingStep />
            case 3:
                return <ReviewStep />
            case 4:
                return <RideCreationSuccessStep />
            default:
                return null
        }
    }

    return (
        <FormProvider {...methods}>
            <Card className="w-full mx-auto border-none shadow-none">
                <CardContent>
                    <div className="mb-8">
                        <Stepper className='bg-amber-600' currentStep={step} steps={steps} />
                    </div>
                    <div className="mt-8">
                        <form autoComplete="off">
                            {renderStep()}
                        </form>
                    </div>
                </CardContent>
                <CardFooter className={`flex ${step === 4 ? 'justify-center gap-4' : 'justify-between'}`}>
                    {step === 4 ? (
                        <>
                            <Button 
                                className="bg-white hover:bg-amber-600 hover:text-white border border-amber-600 text-amber-600 px-6 py-2 rounded" 
                                type="button" 
                                onClick={() => {
                                    setStep(1);
                                    methods.reset();
                                }}
                            >
                                Create Another Ride
                            </Button>
                            <Button 
                                className="bg-amber-600 hover:bg-amber-500" 
                                type="button"
                                onClick={() => redirect('/account?tab=listings')}
                            >
                                View My Listings
                            </Button>
                        </>
                    ) : (
                        <>
                            {step > 1 && (
                                <Button 
                                    className="bg-amber-600 hover:bg-amber-500" 
                                    type="button" 
                                    variant="outline" 
                                    onClick={prevStep}
                                >
                                    Previous
                                </Button>
                            )}
                            {step < steps.length ? (
                                <Button 
                                    className="bg-amber-600 hover:bg-amber-500" 
                                    type="button" 
                                    onClick={nextStep}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button 
                                    className="bg-amber-600 hover:bg-amber-500"  
                                    type="submit" 
                                    onClick={methods.handleSubmit(onSubmit)}
                                >
                                    Submit
                                </Button>
                            )}
                        </>
                    )}
                </CardFooter>
            </Card>
        </FormProvider>
    )
}

