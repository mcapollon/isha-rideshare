'use client'

import { useEffect, useState } from 'react'
import { useForm, FormProvider, useFormContext } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import RideDetailsStep from './steps/ride-details'
import PricingStep from './steps/pricing'
import ContactDetailsStep from './steps/contact-details'
import ReviewStep from './steps/review'
import { Stepper } from './stepper'
import { createClient } from '@/utils/supabase/client'
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

// const steps = ['Ride Details', 'Pricing', 'Contact Details', 'Review'];
const steps = ['Ride Details', 'Pricing', 'Review'];

export default function MultistepForm() {
    const [step, setStep] = useState(1)

    const schema = yup
        .object({
            // .test('Please choose a valid starting point', () => getDirections(methods.getValues('startingPoint'), methods.getValues('ishaYogaCenter'))),
            startingPoint: yup.string().required(),
            ishaYogaCenter: yup.string().required()
            // .test((ctx) => {
            //     getDirections(methods.getValues('startingPoint'), methods.getValues('ishaYogaCenter'));
            //     setError('ishaYogaCenter', { type: "manual", message: "There is no valid route between your starting point and the selected isha yoga center" })
            // }),
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

    useEffect(() => {

        console.log('Starting point:', methods.getValues('startingPoint'))
        console.log('Isha Yoga Center:', methods.getValues('ishaYogaCenter'))

    }, [methods.getValues('ishaYogaCenter'), methods.getValues('startingPoint')])



    const getDirections = (origin, destination) => {
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: origin,
                destination: {
                    lat: parseFloat(destination.lat),
                    lng: parseFloat(destination.lng)
                },
                travelMode: 'DRIVING'
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setValue('rideDistance', result.routes[0].legs[0].distance.value);
                    console.log('Directions result:',
                        {
                            distance: result.routes[0].legs[0].distance,
                            duration: result.routes[0].legs[0].duration,
                            start: result.routes[0].legs[0].start_address,
                            destination: result.routes[0].legs[0].end_address
                        });
                    setValue('routeStatus', 'OK');
                    console.log(getValues('routeStatus'));
                    clearErrors('startingPoint');
                    return true
                } else {
                    setError('startingPoint', { type: "manual", message: "There is no valid route between your starting point and the selected isha yoga center" })
                    console.log('Error fetching directions:', status);
                    if (status == 'NOT_FOUND') {
                        setValue('routeStatus', 'NOT_FOUND');
                        console.log(getValues('routeStatus'));
                        setError('root.serverError', {
                            type: status,
                        })
                    }
                    return false
                }
            }
        );
    }



    const nextStep = () => {
        methods.trigger().then((isValid) => {
            if (step > 1) {
                if (isValid && methods.getValue('rideStatus') == 'OK') {
                    console.log('Current form data:', methods.getValues())
                    setStep(step + 1)
                }
            } else if (isValid) {
                console.log('Current form data:', methods.getValues())
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

