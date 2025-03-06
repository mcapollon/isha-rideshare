"use client"

import { Search, Calendar, MapPin, Clock, Users, Star, Car, ChevronDown, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { format } from "date-fns";
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Controller, useForm } from "react-hook-form";
import Autocomplete from "react-google-autocomplete";
import Link from "next/link";

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
  const [searchTerm, setSearchTerm] = useState('')
  const [noResults, setNoResults] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    getAllRides().then((rides) => {
      setRides(rides)
      fetchUserPictures(rides).then(() => setLoading(false))
      fetchUserNames(rides).then(() => setLoading(false))
    })
  }, [])

  async function getAllRides(page = currentPage, items = itemsPerPage) {
    const from = (page - 1) * items
    const to = from + items - 1

    // First get total count
    const { count } = await supabase
      .from('rides')
      .select('*', { count: 'exact' })
      .gt('seatsRemaining', 0)
      .neq('cancelled', true)

    setTotalItems(count)

    // Then get paginated data
    let { data: rides, error } = await supabase
      .from('rides')
      .select('*')
      .gt('seatsRemaining', 0)
      .neq('cancelled', true)
      .range(from, to)
      .order('created_at', { ascending: false })

    setNoResults(rides?.length === 0)
    return rides
  }

  async function fetchUserPictures(rides) {
    setLoading(true)
    const pictures = {}
    for (const ride of rides) {
      const user = await getUserInfo(ride.createdByUser)
      pictures[ride.createdByUser] = user?.image
    }
    
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

  async function getRidesFiltered(page = currentPage, items = itemsPerPage) {    
    if (searchStartingPoint && searchIshaYogaCenter) {
      const from = (page - 1) * items
      const to = from + items - 1

      // Get total count for filtered results
      const { count } = await supabase
        .from('rides')
        .select('*', { count: 'exact' })
        .ilike('startingCity', encodeURIComponent(searchStartingPoint))
        .ilike('ishaYogaCenter', encodeURIComponent(searchIshaYogaCenter))
        .gt('seatsRemaining', 0)
        .neq('cancelled', true)

      setTotalItems(count)

      // Get paginated filtered results
      let { data: rides, error } = await supabase
        .from('rides')
        .select('*')
        .ilike('startingCity', encodeURIComponent(searchStartingPoint))
        .ilike('ishaYogaCenter', encodeURIComponent(searchIshaYogaCenter))
        .gt('seatsRemaining', 0)
        .neq('cancelled', true)
        .range(from, to)
        .order('created_at', { ascending: false })

      if (error) {
        console.log(error, 'error getting rides')
        return
      }

      setRides(rides || [])
      setNoResults(rides?.length === 0)
      setSearchTerm(searchStartingPoint)
    }    
  }

  const handleReset = () => {
    setSearchStartingPoint('')
    setSearchIshaYogaCenter('')
    setNoResults(false)
    setValue('searchStartingPoint', '')
    setValue('searchIshaYogaCenter', '')
    setValue('searchDeparture', null)
    setCurrentPage(1)
    setItemsPerPage(10)
    getAllRides().then(rides => setRides(rides))
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
          <Button onClick={() => getRidesFiltered()} className="mt-4 w-full bg-amber-600 text-white hover:bg-amber-500">Search</Button>
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
          ) : noResults ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No rides found</h3>
              
              <p className="text-gray-600 text-center max-w-md mb-6">
                {searchTerm 
                  ? `We couldn't find any rides from "${searchTerm}" to "${searchIshaYogaCenter}"`
                  : "We couldn't find any rides matching your search criteria"}
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-8 w-full max-w-md">
                <p className="text-sm text-gray-500 mb-3">You searched for:</p>
                
                <div className="flex items-center mb-2">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-700">From: {searchStartingPoint}</span>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-700">To: {searchIshaYogaCenter}</span>
                </div>
              </div>
              
              <div className="space-y-4 text-gray-600 mb-8">
                <p className="font-medium">Suggestions:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Try different locations</li>
                  <li>Check back later as new rides are added frequently</li>
                  <li>Consider posting your own ride</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleReset}
                  className="flex items-center justify-center px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset search
                </button>
                
                <Link href="/create">
                  <button 
                    className="flex items-center justify-center px-6 py-3 bg-amber-600 rounded-lg text-white hover:bg-amber-500"
                  >
                    Post a ride instead
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            rides.map((ride) => (
              <div key={ride.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow drop-shadow-md">
                <div className="p-6">
                  {/* Driver Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={userPictures[ride.createdByUser] || '/default-user-icon.png'}
                        alt={userNames[ride.createdByUser]}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium">{userNames[ride.createdByUser]}</h3>
                        {/* TODO Review / Star Rating System & Number of User Rides */}
                        {/* <div className="flex items-center space-x-2 text-sm">
                          <div className="flex items-center text-yellow-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="ml-1 text-gray-700">{listing.driver.rating}</span> 
                          </div>
                          <span className="text-gray-500">·</span>
                          <span className="text-gray-500">{listing.driver.totalRides} rides</span>
                        </div> */}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-600">${ride.pricePerSeat}</div>
                      <div className="text-sm text-gray-500">per seat</div>
                    </div>
                  </div>
  
                  {/* Trip Details */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">{ride.startingCity} to {ride.ishaYogaCenter}</div>
                        <div className="text-sm text-gray-500">Pickup: {ride.startingPointAddress}</div>
                      </div>
                    </div>
  
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span>{new Date(ride.departure).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span>{format(ride.departure, 'p')}</span>
                      </div>
                    </div>
  
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-6">
                        {/* <div className="flex items-center space-x-2">
                          <Car className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-600">{listing.carInfo}</span>
                        </div> */}
                        <div className="flex items-center space-x-2">
                          <Users className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-600">{ride.seatsRemaining} seats left</span>
                        </div>
                      </div>
                      <Link href={`/book/${ride.id}`}>
                        <button className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-500">
                          Book now
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {!loading && !noResults && rides.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={async (value) => {
                    const newItemsPerPage = Number(value)
                    setItemsPerPage(newItemsPerPage)
                    setCurrentPage(1)
                    
                    const newRides = searchStartingPoint && searchIshaYogaCenter
                        ? await getRidesFiltered(1, newItemsPerPage)
                        : await getAllRides(1, newItemsPerPage)
                    
                    setRides(newRides)
                  }}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20, 25, 30].map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {value} rides
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">per page</span>
              </div>
      
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} rides
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={async () => {
                        const newPage = currentPage - 1
                        setCurrentPage(newPage)
                        
                        const newRides = searchStartingPoint && searchIshaYogaCenter
                            ? await getRidesFiltered(newPage, itemsPerPage)
                            : await getAllRides(newPage, itemsPerPage)
                        
                        setRides(newRides)
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage * itemsPerPage >= totalItems}
                    onClick={async () => {
                        const newPage = currentPage + 1
                        setCurrentPage(newPage)
                        
                        const newRides = searchStartingPoint && searchIshaYogaCenter
                            ? await getRidesFiltered(newPage, itemsPerPage)
                            : await getAllRides(newPage, itemsPerPage)
                        
                        setRides(newRides)
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}







