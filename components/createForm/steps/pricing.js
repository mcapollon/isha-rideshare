"use client"

import { useFormContext, Controller } from "react-hook-form"
import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import * as SliderPrimitive from "@radix-ui/react-slider"
import useFormStore from "../formStore"

// This is a placeholder function. In a real application, you'd implement
// actual distance calculation logic or use an API.

const CustomPriceSlider = ({
  value,
  onChange,
  min,
  max,
  step,
  disabled,
}) => (
  <SliderPrimitive.Root
    className="relative flex items-center select-none touch-none w-full h-20"
    value={[value]}
    onValueChange={([newValue]) => onChange(newValue)}
    max={max}
    min={min}
    step={step}
    disabled={disabled}
  >
    <SliderPrimitive.Track className="bg-amber-100 relative grow rounded-full h-2">
      <SliderPrimitive.Range className="absolute bg-primary rounded-full h-full" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block w-20 h-12 bg-primary shadow-lg rounded-full focus:outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-opacity-75">
      <div className="flex items-center justify-center h-full text-primary-foreground font-bold">${value}</div>
    </SliderPrimitive.Thumb>
  </SliderPrimitive.Root>
)

export default function PricingStep() {
  const { watch, setValue, getValues, register, control } = useFormContext()
  const [useCustomPrice, setUseCustomPrice] = useState(false)
  
  const [recommendedPrice, setRecommendedPrice] = useState(5)

  const formStoreRideDistanceMeters = useFormStore((state) => state.formStoreRideDistanceMeters)
  const formStorePricePerSeat = useFormStore((state) => state.formStorePricePerSeat)
  const updateFormStorePricePerSeat = useFormStore((state) => state.updateFormStorePricePerSeat)

  const calculateRecommendedPrice = (distance) => {
    const intercept = 4.65;
    const linearCoefficient = 0.0648;
    const quadraticCoefficient = 0.00000137591;
  
    // Apply the formula
    const price =
      quadraticCoefficient * Math.pow((distance / 1000), 2) +
      linearCoefficient * (distance / 1000) +
      intercept;
  
    return parseInt(price)
  }

  useEffect(() => {
    const recommendedPrice = calculateRecommendedPrice(formStoreRideDistanceMeters);
    setRecommendedPrice(recommendedPrice);
    setValue("pricePerSeat", recommendedPrice);
    updateFormStorePricePerSeat(recommendedPrice)
  }, [formStoreRideDistanceMeters])

  useEffect(() => {
    if (isNaN(watch("pricePerSeat"))) {
      setValue("pricePerSeat", 0)
    }

  }, [watch("pricePerSeat")])

  return (
    <div className="space-y-6">
      <div>
        <Label>Price per Seat</Label>
        <Controller
          name="pricePerSeat"
          control={control}
          defaultValue={calculateRecommendedPrice(formStoreRideDistanceMeters)}
          render={({ field }) => (
            <CustomPriceSlider
              min={0}
              max={recommendedPrice * 1.5}
              step={1}
              value={field.value}
              onChange={(value) => {
                if (!isNaN(value)) {
                  field.onChange(value);
                  updateFormStorePricePerSeat(value)
                }
              }}
              disabled={!useCustomPrice}
            />
          )}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="custom-price" checked={useCustomPrice} onCheckedChange={setUseCustomPrice} />
        <Label htmlFor="custom-price">Set custom price - ask for an amount that you consider fair!</Label>
      </div>
      {useCustomPrice && (
        <div className="space-y-2">
          <Label htmlFor="customPrice">Custom Price per Seat</Label>
          <Input
            id="customPrice"
            type="number"
            value={watch("pricePerSeat")}
            min={0}
            {...register("pricePerSeat", {
              valueAsNumber: true,
              min: 0,
            })}
          />
        </div>
      )}
    </div>
  )
}

