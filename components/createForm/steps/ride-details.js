'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import Autocomplete from "react-google-autocomplete";
import useFormStore from '../formStore'

const ishaYogaCenters = [
    {
        name: 'Isha Yoga Center, Coimbatore',
        address: 'XPGP+CMF, Isha Yoga Center Rd, Ikkaraibooluvampatti, Tamil Nadu 641114, India',
        coordinates: { lat: '10.9763407', long: '76.7342506' }
    },
    {
        name: 'Sadhguru Sannidhi, Bengaluru',
        address: 'FPP4+MH, Avalagurki, Karnataka 562101',
        coordinates: { lat: '13.4861346', long: '77.7064053' }
    },
    {
        name: 'Sadhguru Sanndhi, Chattarpur',
        address: 'Mandi Road, 4, Osho Dr, Gadaipur, New Delhi, Delhi 110030',
        coordinates: { lat: '28.4813421', long: '77.1517377' }
    },
    {
        name: 'Isha Institute of Inner-sciences (iii)',
        address: '951 Isha Lane, McMinnville, TN - 37110, USA',
        coordinates: { lat: '35.5649253', long: '-85.5729322' }
    },
    {
        name: 'Isha Yoga Center, California',
        address: 'Isha Yoga Center LA, 7045 Farralone Ave. Canoga Park, CA 91303',
        coordinates: { lat: '34.1991773', long: '-118.6128837' }
    }
]

const luggageOptions = [
    { value: "no_luggage", label: "No Luggage" },
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
]

export default function RideDetailsStep() {
    const { register, control, setValue, setError, formState: { errors }, clearErrors } = useFormContext()

    const formStoreStartingCoordinates = useFormStore((state) => state.formStoreStartingCoordinates)
    const formStoreIshaYogaCenterCoordinates = useFormStore((state) => state.formStoreIshaYogaCenterCoordinates)
    const formStoreRouteStatus = useFormStore((state) => state.formStoreRouteStatus)

    const updateFormStoreStartingCoordinates = useFormStore((state) => state.updateFormStoreStartingCoordinates)
    const updateFormStoreIshaYogaCenterCoordinates = useFormStore((state) => state.updateFormStoreIshaYogaCenterCoordinates)
    const updateFormStoreRouteStatus = useFormStore((state) => state.updateFormStoreRouteStatus)
    const updateFormStoreRideDistance = useFormStore((state) => state.updateFormStoreRideDistance)

    const [startingCoordinates, setStartingCoordinates] = useState(null)

    useEffect(() => {
        if (formStoreStartingCoordinates && formStoreIshaYogaCenterCoordinates) {
            getDirections(formStoreStartingCoordinates, formStoreIshaYogaCenterCoordinates);
        }
    }, [formStoreIshaYogaCenterCoordinates, formStoreStartingCoordinates]);

    const getDirections = async (origin, destination) => {
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: origin,
                destination: destination,
                travelMode: 'DRIVING'
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    updateFormStoreRideDistance(result.routes[0].legs[0].distance.value)
                    setValue('rideDistance', result.routes[0].legs[0].distance.value)
                    // console.log('Directions result:',
                    //     {
                    //         distance: result.routes[0].legs[0].distance,
                    //         duration: result.routes[0].legs[0].duration,
                    //         start: result.routes[0].legs[0].start_address,
                    //         destination: result.routes[0].legs[0].end_address
                    //     });
                    updateFormStoreRouteStatus('OK')
                    clearErrors('startingPointAddress');
                    clearErrors('ishaYogaCenter');
                } else {
                    setError('startingPointAddress', { type: "manual", message: "There is no valid route between your starting point and the selected isha yoga center" })
                    updateFormStoreRouteStatus('NO_ROUTE')
                }
            }
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="startingPointAddress">Starting Point</Label>
                <Controller
                    name="startingPointAddress"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <Autocomplete
                            {...field}
                            value={field.value}
                            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS}
                            onPlaceSelected={(place) => {
                                field.onChange(place.formatted_address);
                                const lat = place.geometry.location.lat();
                                const lng = place.geometry.location.lng();
                                const coordinates = { lat, lng };
                                setStartingCoordinates(coordinates);
                                updateFormStoreStartingCoordinates(coordinates)
                                setValue('startingCity', place.address_components[3].long_name);
                                clearErrors('startingPointAddress');
                            }}
                            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
                            options={{
                                types: ['address'],
                            }}
                            onFocus={(e) => e.target.autocomplete = 'off'}
                        />
                    )}
                 />                
                {errors.startingPointAddress && <span className="text-red-500">{errors.startingPointAddress.message}</span>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="ishaYogaCenter">Isha Yoga Center</Label>
                <Controller
                    name="ishaYogaCenter"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (                        
                        <Select {...field}  onValueChange={(e) => { field.onChange(e); updateFormStoreIshaYogaCenterCoordinates(e); clearErrors('ishaYogaCenter') }}>
                            <SelectTrigger>
                                <SelectValue onChange={(e) => console.log('select value changed', e)} placeholder="Please select Isha Yoga Center" />
                            </SelectTrigger>
                            <SelectContent>
                                {ishaYogaCenters.map((ishaYogaCenter, i) => (
                                    <SelectItem key={i} value={ishaYogaCenter.name}>{ishaYogaCenter.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.ishaYogaCenter && <span className="text-red-500">{errors.ishaYogaCenter.message}</span>}
            </div>
            <div className="space-y-2 inline-grid">
                <Label htmlFor="departure">Departure</Label>
                <Controller
                    name="departure"
                    control={control}
                    defaultValue={null}
                    onFocus={(e) => e.target.autocomplete = 'off'}
                    render={({ field }) => (
                        <DatePicker
                            id="departure"
                            selected={field.value}
                            onChange={(date) => { field.onChange(date); clearErrors('departure') }}
                            showTimeSelect
                            dateFormat="MMMM d, yyyy h:mm aa"
                            minDate={new Date()}
                            className="w-full p-2 border rounded-md"
                        />
                    )}
                />
                {errors.departure && <span className="text-red-500">{errors.departure.message}</span>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="seats">Number of Seats</Label>
                <Controller 
                    name='seats'
                    control={control}
                    render={({ field }) => (
                        <Select {...field} onValueChange={(e) => {field.onChange(e); clearErrors('seats')}}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select seats" />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    />
                
                {errors.seats && <span className="text-red-500">{errors.seats.message}</span>}
            </div>
            <div className="space-y-2 col-span-full">
                <Label>Luggage</Label>
                <Controller 
                    name='luggage'
                    control={control}
                    render={({ field }) => (
                        <RadioGroup {...field} onValueChange={(e) => {field.onChange(e); clearErrors('luggage')}}>
                            {luggageOptions.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option.value} id={option.value} />
                                    <Label htmlFor={option.value}>{option.label}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )}
                />
                {errors.luggage && <span className="text-red-500">{errors.luggage.message}</span>}
            </div>
            <div className="space-y-2 col-span-full">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    {...register("description", { required: "Description is required" })}
                    placeholder="Add any additional details about your ride and more information about pickup location."
                    onChange={() => clearErrors('description')}
                />
                {errors.description && <span className="text-red-500">{errors.description.message}</span>}
            </div>
        </div>
    )
}

