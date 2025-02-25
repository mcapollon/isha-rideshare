'use client'

import { useEffect, useState } from 'react'
import { useForm, FormProvider, useFormContext } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import RideDetailsStep from './steps/ride-details'
import PricingStep from './steps/pricing'
import ReviewStep from './steps/review'
import { Stepper } from './stepper'
import { createClient } from '@/utils/supabase/client'
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import useFormStore from './formStore'
import { useSession } from 'next-auth/react'

// const steps = ['Ride Details', 'Pricing', 'Contact Details', 'Review'];
const steps = ['Ride Details', 'Pricing', 'Review'];

export default function MultistepForm() {
    const [step, setStep] = useState(1)

    const formStoreRouteStatus = useFormStore((state) => state.formStoreRouteStatus)
    const formStoreStartingCoordinates = useFormStore((state) => state.formStoreStartingCoordinates)
    const formStoreRideDuration = useFormStore((state) => state.formStoreRideDuration)

    const {data: session} = useSession()

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
            description: yup.string().required('Description is required')

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
            rideDistanceMeters: null
        },
        resolver: yupResolver(schema),
    })

    const { setValue, getValues, setError, clearErrors } = methods

    const nextStep = (data) => {
        methods.trigger().then((isValid) => {
            if (step > 1) {
                if (isValid) {
                    setStep(step + 1)
                }
            } else if (isValid) {
                setStep(step + 1)
            }
        })

        console.log(getValues())
    }
    const prevStep = () => setStep(step - 1)

    const onSubmit = async (data) => {

        const supabase = createClient()
        const { error } = await supabase
            .from('rides')
            .insert({
                startingPointAddress: data.startingPointAddress,
                startingPointCoordinates: formStoreStartingCoordinates,
                startingCity: data.startingCity,
                ishaYogaCenter: data.ishaYogaCenter,
                departure: data.departure,
                seats: data.seats,
                luggage: data.luggage,
                description: data.description,
                rideDistanceMeters: data.rideDistanceMeters,
                rideDuration: formStoreRideDuration,
                pricePerSeat: data.pricePerSeat,
                createdByUser:  session.user.id,
                seatsRemaining: data.seats
            })
        if (error) {
            console.log(error, 'form error')
        }

        setStep(3)
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return <RideDetailsStep />
            case 2:
                return <PricingStep />
            // case 3:
            //     return <ContactDetailsStep />
            case 3:
                return <ReviewStep />
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
                        <form>
                            {renderStep()}
                        </form>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    {step > 1 && (
                        <Button className="bg-amber-600 hover:bg-amber-500" type="button" variant="outline" onClick={prevStep}>
                            Previous
                        </Button>
                    )}
                    {step < steps.length ? (
                        <Button className="bg-amber-600 hover:bg-amber-500" type="button" onClick={nextStep}>
                            Next
                        </Button>
                    ) : (
                        <Button className="bg-amber-600 hover:bg-amber-500"  type="submit" onClick={methods.handleSubmit(onSubmit)}>Submit</Button>
                    )}
                </CardFooter>
            </Card>
        </FormProvider>
    )
}

