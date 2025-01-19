'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import RideDetailsStep from './steps/ride-details'
import PricingStep from './steps/pricing'
import ContactDetailsStep from './steps/contact-details'
import ReviewStep from './steps/review'
import { Stepper } from './stepper'


const steps = ['Ride Details', 'Pricing', 'Contact Details', 'Review'];

export default function MultistepForm() {
  const [step, setStep] = useState(1)
  const methods = useForm()

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  const onSubmit = (data) => {
    console.log('Form submitted:', data)
    // Here you would typically send the form data to your backend
    setStep(4)
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return <RideDetailsStep />
      case 2:
        return <PricingStep />
      case 3:
        return <ContactDetailsStep />
      case 4:
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
            <form onSubmit={methods.handleSubmit(onSubmit)}>
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
          {step < 4 ? (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type="submit">Submit</Button>
          )}
        </CardFooter>
      </Card>
    </FormProvider>
  )
}

