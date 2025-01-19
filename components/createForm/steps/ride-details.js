'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import Autocomplete from "react-google-autocomplete";
import { usePlacesWidget } from "react-google-autocomplete";
// import Script from 'next/script'
import axios from 'axios'

const destinations = [
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio"
]
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
    const { register, control, watch, getValues } = useFormContext()

    const [selected, setSelected] = useState(ishaYogaCenters[3])
    const [ishaYogaCenterSelectedCoordinates, setIshaYogaCenterSelectedCoordinates] = useState({ lat: 10.9763407, lng: 76.7342506 })
    const [startingPointValue, setStartingPointValue] = useState('')
    const [mem, setMem] = useState(luggageOptions[2])
    const [countryCode, setCountryCode] = useState('')
    const [directionsResult, setDirectionsResult] = useState(null);

    useEffect(() => {
        // Fetch user's country code based on IP address
        axios.get('https://ipinfo.io/json?token=' + process.env.NEXT_PUBLIC_IPINFO_TOKEN)
            .then(response => {
                setCountryCode(response.data.country)
            })
            .catch(error => {
                console.error('Error fetching user country code:', error);
            });
    }, []);

    const handleIshaYogaCenterChange = (e) => {
        switch (e) {
            case 'Isha Yoga Center, Coimbatore':
                setIshaYogaCenterSelectedCoordinates({ lat: 10.9763407, lng: 76.7342506 });
                console.log('Isha Yoga Center - Switch:', getValues('ishaYogaCenter'));
                return { lat: 10.9763407, lng: 76.7342506 }
                break;
            case 'Sadhguru Sannidhi, Bengaluru':
                setIshaYogaCenterSelectedCoordinates({ lat: 13.4861346, lng: 77.7064053 });
                console.log('Isha Yoga Center - Switch:', getValues('ishaYogaCenter'));
                return { lat: 13.4861346, lng: 77.7064053 }
                break;
            case 'Sadhguru Sanndhi, Chattarpur':
                setIshaYogaCenterSelectedCoordinates({ lat: 28.4813421, lng: 77.1517377 });
                console.log('Isha Yoga Center - Switch:', getValues('ishaYogaCenter'));
                return { lat: 28.4813421, lng: 77.1517377 }
                break;
            case 'Isha Institute of Inner-sciences (iii)':
                setIshaYogaCenterSelectedCoordinates({ lat: 35.5649253, lng: -85.5729322 });
                console.log('Isha Yoga Center - Switch:', getValues('ishaYogaCenter'));
                return { lat: 35.5649253, lng: -85.5729322 }
                break;
            case 'Isha Yoga Center, California':
                setIshaYogaCenterSelectedCoordinates({ lat: 34.1991773, lng: -118.6128837 });
                console.log('Isha Yoga Center - Switch:', getValues('ishaYogaCenter'));
                return { lat: 34.1991773, lng: -118.6128837 }
                break;
            default:
                setIshaYogaCenterSelectedCoordinates({ lat: 10.9763407, lng: 76.7342506 });
                console.log('Isha Yoga Center - Switch:', getValues('ishaYogaCenter'));
                return { lat: 10.9763407, lng: 76.7342506 }
                break;
        }
    };

    const handleOriginSelected = (place) => {
        
        let origin;

        if (place.geometry) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            console.log('Isha Yoga Center:', { ishaYogaCenterSelectedCoordinates });
            origin = { lat: lat, lng: lng };
        } else {
            console.log('geometry does not exist')
            origin = place.place_id;
            console.log('Origin:', origin);
        }

        // Check if a driving route exists between the starting point and the selected Isha Yoga center
        const directionsService = new window.google.maps.DirectionsService();
        console.log('Isha Yoga Center - Right before Direction Services:', getValues('ishaYogaCenter'));
        directionsService.route(
            {
                origin: origin,
                destination: {
                    lat: parseFloat(handleIshaYogaCenterChange(getValues('ishaYogaCenter')).lat),
                    lng: parseFloat(handleIshaYogaCenterChange(getValues('ishaYogaCenter')).lng)
                },
                travelMode: 'DRIVING'
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirectionsResult(result);
                    console.log('Directions result:', result);
                } else {
                    console.log('Error fetching directions:', status);
                }
            }
        );
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="startingPoint">Starting Point</Label>
                <Autocomplete
                    apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS}
                    onPlaceSelected={handleOriginSelected}
                    id='startingPoint'
                    // ref={startingPointRef}
                    {...register('startingPoint', { required: false })}
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
                    options={{
                        componentRestrictions: { country: [countryCode.toString()] },
                        types: ['address'],
                    }}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Controller
                    name="ishaYogaCenter"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Isha Yoga Center is required" }}
                    render={({ field }) => (
                        <Select {...field} onValueChange={(e) => {field.onChange(e); handleIshaYogaCenterChange(e)}}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Isha Yoga Center" />
                            </SelectTrigger>
                            <SelectContent>
                                {ishaYogaCenters.map((ishaYogaCenter, i) => (
                                    <SelectItem key={i} value={ishaYogaCenter.name}>{ishaYogaCenter.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>
            <div className="space-y-2 inline-grid">
                <Label htmlFor="departure">Departure</Label>
                <DatePicker
                    id="departure"
                    selected={watch("departure")}
                    onChange={(date) => control.setValue("departure", date)}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={new Date()}
                    className="w-full p-2 border rounded-md"
                />
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
                    placeholder="Add any additional details about your ride"
                />
            </div>
            {/* <Script src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS}&loading=async&libraries=places`} /> */}
        </div>
    )
}

