'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

const destinations = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio"
]

const luggageOptions = [
  { value: "no_luggage", label: "No Luggage" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
]

export default function RideDetailsStep() {
  const { register, control, watch } = useFormContext()

  return (
    (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="startingPoint">Starting Point</Label>
        <Input
          id="startingPoint"
          {...register("startingPoint", { required: "Starting point is required" })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="destination">Destination</Label>
        <Select {...register("destination", { required: "Destination is required" })}>
          <SelectTrigger>
            <SelectValue placeholder="Select destination" />
          </SelectTrigger>
          <SelectContent>
            {destinations.map((dest) => (
              <SelectItem key={dest} value={dest}>{dest}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="departure">Departure</Label>
        <DatePicker
          id="departure"
          selected={watch("departure")}
          onChange={(date) => control.setValue("departure", date)}
          showTimeSelect
          dateFormat="MMMM d, yyyy h:mm aa"
          minDate={new Date()}
          className="w-full p-2 border rounded-md" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="seats">Number of Seats</Label>
        <Select {...register("seats", { required: "Number of seats is required" })}>
          <SelectTrigger>
            <SelectValue placeholder="Select seats" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 col-span-full">
        <Label>Luggage</Label>
        <RadioGroup {...register("luggage", { required: "Luggage option is required" })}>
          {luggageOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="space-y-2 col-span-full">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Add any additional details about your ride" />
      </div>
    </div>)
  );
}

