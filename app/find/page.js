"use client"

import { Search, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { format } from "date-fns";
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Controller, useForm } from "react-hook-form";
import Autocomplete from "react-google-autocomplete";
import Link from "next/link"

export default function Page() {
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

  const supabase = createClient()

  const { register, control, watch, getValues, setValue, setError, formState: { errors }, clearErrors } = useForm()
  const [rides, setRides] = useState([])
  const [userPictures, setUserPictures] = useState({})
  const [userNames, setUserNames] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllRides().then((rides) => {
      setRides(rides)
      fetchUserPictures(rides).then(() => setLoading(false))
      fetchUserNames(rides).then(() => setLoading(false))
      console.log(rides)
    })
  }, [])

  async function getAllRides() {
    let { data: rides, error } = await supabase
      .from('rides')
      .select('*')

      return rides
  }

  async function fetchUserPictures(rides) {
    setLoading(true)
    const pictures = {}
    for (const ride of rides) {
      const user = await getUserInfo(ride.createdByUser)
      pictures[ride.createdByUser] = user?.image
    }
    console.log(pictures)
    setUserPictures(pictures)
  }

  async function fetchUserNames(rides) {
    setLoading(true)
    const names = {}
    for (const ride of rides) {
      const user = await getUserInfo(ride.createdByUser)
      names[ride.createdByUser] = user?.name
    }
    setUserNames(names)
  }

  async function getUserInfo(uid) {
    let { data: user, error } = await supabase.schema('next_auth')
      .from('users')
      .select('name, image')
      .eq('id', uid)
      .single()

      return user
  }

  const [searchStartingPoint, setSearchStartingPoint] = useState('')
  const [searchIshaYogaCenter, setSearchIshaYogaCenter] = useState('')

  async function getRidesFiltered() {    

    if (searchStartingPoint && searchIshaYogaCenter) {
      let { data: rides, error } = await supabase
      .from('rides')
      .select('*')
      .ilike('startingCity', encodeURIComponent(searchStartingPoint))
      .ilike('ishaYogaCenter', encodeURIComponent(searchIshaYogaCenter))

      setRides(rides)
      console.log(rides)
      if (error) () => console.log(error, 'error getting rides')
    }

    
  }

  return (
    <div className="min-h-screen">
      {/* Search Section */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-white rounded-lg shadow-lg p-6 mx-auto border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="">
              <Controller
                name="searchStartingPoint"
                control={control}
                rules={{ required: "Starting point is required" }}
                defaultValue=""
                render={({ field }) => (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
                    <Autocomplete
                    {...field}
                    value={field.value}
                    placeholder="Please enter a city"
                    apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS}
                    onPlaceSelected={(place) => {
                      console.log(place)
                      setSearchStartingPoint(place.address_components[0].long_name);
                      field.onChange(place.address_components[0].long_name);
                      clearErrors('searchStartingPoint');
                    }}
                    className='flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
                    options={{
                      types: ['locality'],
                    }}
                  />
                  </div>
                  
                )}
              />
            </div>
            <div className="relative">
            <Controller
                    name="searchIshaYogaCenter"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Isha Yoga Center is required" }}
                    render={({ field }) => (
                        <Select {...field} onValueChange={(e) => { field.onChange(e); setSearchIshaYogaCenter(e); clearErrors('searchIshaYogaCenter'); }}>
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
            <div className="inline-grid">
              <Controller
                name="searchDeparture"
                control={control}
                defaultValue={null}
                rules={{ required: "Departure date and time is required" }}
                render={({ field }) => (
                  <DatePicker
                    id="searchDeparture"
                    selected={field.value}
                    showIcon
                    icon={<Calendar className="h-4 w-4 text-black/50 translate-y-1" />}
                    onChange={(date) => { field.onChange(date); clearErrors('searchDeparture') }}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={new Date()}
                    className="w-full p-2 border rounded-md flex h-10 border-input bg-background text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  />
                )}
              />
            </div>
          </div>
          <Button onClick={() => getRidesFiltered()} className="mt-4 w-full bg-black text-white hover:bg-black/90">Search</Button>
        </div>

        {/* Results */}
        <div className="mt-8 space-y-4">
        {loading ? (
            <Card className="bg-gray-300 animate-pulse">
            <CardContent className="flex items-center gap-4 p-6">
              <Avatar className="h-16 w-16 bg-gray-400">
                {/* <AvatarFallback>DR</AvatarFallback> */}
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-400 rounded w-3/4"></div>
                <div className="h-4 bg-gray-400 rounded w-1/2"></div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-4 bg-gray-400 rounded w-1/4"></div>
                <div className="h-4 bg-gray-400 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
          ) : (
            rides.map((ride, i) => (
              <Card key={i} className="bg-white">
                <Link href={`book/${ride.id}`}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="border-r-2 p-4 border-slate-200 flex flex-col items-center">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={userPictures[ride.createdByUser] || './default-user-icon.png'} />
                      <AvatarFallback>DR</AvatarFallback>
                    </Avatar>
                    <p className="font-sans text-center mt-2">{userNames[ride.createdByUser]}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{ride.startingCity} to {ride.ishaYogaCenter}</h3>
                      <Badge variant="outline" className="bg-[#d9cebc] text-black px-3 py-1 rounded-full text-sm">
                        {format(new Date(ride.departure), 'p')}
                      </Badge>
                    </div>
                    <div className="text-sm text-black/60">Pickup: {ride.startingPointAddress}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${ride.pricePerSeat}</div>
                    <div className="text-sm text-black/60">{ride.seats} seats left</div>
                  </div>
                </CardContent>
                </Link>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}