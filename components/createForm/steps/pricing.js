"use client"

import { useFormContext, Controller } from "react-hook-form"
import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import * as SliderPrimitive from "@radix-ui/react-slider"
import useFormStore from "../formStore"
import useGlobalStore from "@/lib/globalStore"

// This is a placeholder function. In a real application, you'd implement
// actual distance calculation logic or use an API.

const currencySymbols = {
  USD: '$',
  CAD: 'CA$',
  INR: '₹',
  // add more as needed
};

const CustomPriceSlider = ({
  value,
  onChange,
  min,
  max,
  step,
  disabled,
  currencySymbol = "$",
  currencyCode = "USD",
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
    <SliderPrimitive.Thumb className="w-24 h-14 bg-primary shadow-lg rounded-full focus:outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-opacity-75 flex flex-col items-center justify-center">
      <span className="text-lg font-bold text-primary-foreground flex items-baseline">
        <span className="mr-1">{currencySymbol}</span>
        {value}
      </span>
      {/* <span className="text-xs text-primary-foreground/80 font-medium mt-0.5">{currencyCode}</span> */}
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

  const globalStoreCurrency = useGlobalStore((state) => state.globalStoreCurrency) || 'USD'; // fallback to USD

  useEffect(() => {
    setValue('currency', globalStoreCurrency);
  }, [globalStoreCurrency, setValue]);

  const calculateRecommendedPrice = (distance, currency) => {
    //Price = base amount + (a small amount × distance) + (an even smaller amount × distance²)

    const intercept = 4.65; //base amount
    const linearCoefficient = 0.0648;
    const quadraticCoefficient = 0.00000137591;
  
    // Apply the formula
    let price =
      quadraticCoefficient * Math.pow((distance / 1000), 2) +
      linearCoefficient * (distance / 1000) +
      intercept;

    if (currency === 'INR') {
      price = price * 60
    }
  
    return parseInt(price)
  }

  useEffect(() => {
    const recommendedPrice = calculateRecommendedPrice(formStoreRideDistanceMeters, globalStoreCurrency);
    setRecommendedPrice(recommendedPrice);
    setValue("pricePerSeat", recommendedPrice);
    updateFormStorePricePerSeat(recommendedPrice)
  }, [formStoreRideDistanceMeters, globalStoreCurrency])

  useEffect(() => {
    if (isNaN(watch("pricePerSeat"))) {
      setValue("pricePerSeat", 0)
    }

  }, [watch("pricePerSeat")])

  

  return (
    <div className="space-y-6">
      <div>
        <Label>
          Price per Seat:
          <span className="ml-2 text-gray-500">
              {currencySymbols[globalStoreCurrency] || globalStoreCurrency} ({globalStoreCurrency})
            </span>
        </Label>
        <Controller
          name="pricePerSeat"
          control={control}
          defaultValue={calculateRecommendedPrice(formStoreRideDistanceMeters)}
          render={({ field }) => (
            <CustomPriceSlider
              min={0}
              max={recommendedPrice * 2.5}
              step={1}
              value={field.value}
              currencySymbol={currencySymbols[globalStoreCurrency] || globalStoreCurrency}
              currencyCode={globalStoreCurrency}
              onChange={(value) => {
                if (!isNaN(value)) {
                  field.onChange(value);
                  updateFormStorePricePerSeat(value)
                }
              }}
              disabled={useCustomPrice}
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
          <Label htmlFor="customPrice">
            Custom Price per Seat
            <span className="ml-2 text-gray-500">
              {currencySymbols[globalStoreCurrency] || globalStoreCurrency} ({globalStoreCurrency})
            </span>
          </Label>
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
      <div className="flex items-center space-x-2">
        <Controller
          name="payInCash"
          control={control}
          defaultValue={false}
          render={({ field }) => (
            <Switch
              id="payInCash"
              checked={!!field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="payInCash">Pay in Cash</Label>
      </div>
    </div>
  )
}

