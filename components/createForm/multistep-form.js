'use client'

import { useState } from 'react'
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

// const steps = ['Ride Details', 'Pricing', 'Contact Details', 'Review'];
const steps = ['Ride Details', 'Pricing', 'Review'];

export default function MultistepForm() {
    const [step, setStep] = useState(1)
    const formStoreRouteStatus = useFormStore((state) => state.formStoreRouteStatus)

    const schema = yup
        .object({
            startingPointAddress: yup.string().required('Starting Point is required')
            .test('routeStatus', 'There is no valid route between your starting point and the selected isha yoga center',() => {
                console.log(formStoreRouteStatus, '- STARTING POINT TEST - ROUTE STATUS')
                if (formStoreRouteStatus === 'OK') {
                    return true
                } else return false
            }),
            ishaYogaCenter: yup.string().required('Choosing an Isha Yoga Center is required')
            .test('routeStatus', 'There is no valid route between the your starting point and the selected Isha Yoga Center',() => {
                console.log(formStoreRouteStatus, '- ISHA YOGA CENTER TEST - ROUTE STATUS')
                if (formStoreRouteStatus === 'OK') {
                    return true
                } else return false
            }),
        })
        .required()

    const methods = useForm({
        mode: 'onBlur',
        defaultValues: {
            startingPoint: '',
            startingCity: '',
            ishaYogaCenter: '',
            departure: null,
            seats: '',
            luggage: '',
            description: '',
            rideDistance: null
        },
        resolver: yupResolver(schema),
    })

    const { setValue, getValues, setError, clearErrors } = methods

    const nextStep = () => {
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
        console.log('Form submitted:', data)

        const supabase = createClient()
        const { error } = await supabase
            .from('rides')
            .insert({
                startingPoint: data.startingPoint,
                startingCity: data.startingCity,
                ishaYogaCenter: data.ishaYogaCenter,
                departure: data.departure,
                seats: data.seats,
                luggage: data.luggage,
                description: data.description,
                rideDistance: data.rideDistance,
                pricePerSeat: data.pricePerSeat,
            })
        if (error) {
            console.log(error, 'form error')
        }

        // Here you would typically send the form data to your backend
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
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Ride Booking Form</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-8">
                        <Stepper currentStep={step} steps={steps} />
                    </div>
                    <div className="mt-8">
                        <form>
                            {renderStep()}
                        </form>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    {step > 1 && (
                        <Button type="button" variant="outline" onClick={prevStep}>
                            Previous
                        </Button>
                    )}
                    {step < steps.length ? (
                        <Button type="button" onClick={nextStep}>
                            Next
                        </Button>
                    ) : (
                        <Button type="submit" onClick={methods.handleSubmit(onSubmit)}>Submit</Button>
                    )}
                </CardFooter>
            </Card>
        </FormProvider>
    )
}

