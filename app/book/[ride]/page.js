"use client"
import React, { useEffect, useState, use, useRef } from 'react'
import { createClient } from "@/utils/supabase/client"
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, DollarSign, MessageCircle, Star, Car, Shield, CreditCard, Lock, CheckCircle } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentSection from '@/components/payment-form/paymentSection';
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import usePaymentStore from '../../../components/payment-form/paymentStore'
import DriverRatingDisplay from '@/components/reviews/DriverRatingDisplay';
import DriverReviews from '@/components/reviews/DriverReviews';
import Link from 'next/link';
import useGlobalStore from '@/lib/globalStore'

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("Stripe Public Key is not defined")
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)

function Page({ params }) {

  const { data: session, status } = useSession()

  const ride = use(params)
  const supabase = createClient()
  const paymentSectionRef = useRef();

  const paymentStoreAmount = usePaymentStore((state) => state.paymentStoreAmount)
  const paymentStorePricePerSeat = usePaymentStore((state) => state.paymentStorePricePerSeat)
  const paymentStoreServiceFee = usePaymentStore((state) => state.paymentStoreServiceFee)
  const paymentStoreAmountInCents = usePaymentStore((state) => state.paymentStoreAmountInCents)
  const paymentStoreIsCash = usePaymentStore((state) => state.paymentStoreIsCash)
  const paymentStoreDisplayTotal = usePaymentStore((state) => state.paymentStoreDisplayTotal)
  const updatePaymentStoreIsCash = usePaymentStore((state) => state.updatePaymentStoreIsCash)
  const updatePaymentStoreDisplayTotal = usePaymentStore((state) => state.updatePaymentStoreDisplayTotal)
  const updatePaymentStorePricePerSeat = usePaymentStore((state) => state.updatePaymentStorePricePerSeat)
  const updatePaymentStoreAmount = usePaymentStore((state) => state.updatePaymentStoreAmount)
  const updatePaymentStoreAmountInCents = usePaymentStore((state) => state.updatePaymentStoreAmountInCents)
  const updatePaymentStoreSeatCountIncrement = usePaymentStore((state) => state.updatePaymentStoreSeatCountIncrement)
  const updatePaymentStoreSeatCountDecrement = usePaymentStore((state) => state.updatePaymentStoreSeatCountDecrement)
  const updatePaymentStorePaymentStoreSeatLimit = usePaymentStore((state) => state.updatePaymentStorePaymentStoreSeatLimit)
  const updatePaymentStoreServiceFee = usePaymentStore((state) => state.updatePaymentStoreServiceFee)

  const [loading, setLoading] = useState(true)
  const [rideData, setRideData] = useState(null)
  const [userData, setUserData] = useState(null);
  const [seatCount, setSeatCount] = useState(1);
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);
  const [bookedUsers, setBookedUsers] = useState([]);
  const userCurrency = useGlobalStore(state => state.globalStoreCurrency) || 'USD';
  const [convertedPricePerSeat, setConvertedPricePerSeat] = useState(null);
  const [convertedServiceFee, setConvertedServiceFee] = useState(null);
  const [convertedTotal, setConvertedTotal] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [driverStripeConnectId, setDriverStripeConnectId] = useState(null);

  // Fetch exchange rates and convert prices
  useEffect(() => {
    async function fetchRatesAndConvert() {
      const res = await fetch(`https://open.er-api.com/v6/latest/${rideData?.currency || 'CAD'}`);
      const data = await res.json();
      
      if (rideData) {
        const from = rideData.currency || 'CAD';
        const to = userCurrency;
        const pricePerSeat = rideData.pricePerSeat;
        // Always convert service fee from CAD to user's currency
        const serviceFeeCAD = 5;
        const convert = (amount, fromCur, toCur) => {
          if (!data.rates[fromCur] || !data.rates[toCur]) return amount;
          const amountInBase = amount / data.rates[fromCur];
          return Math.round(amountInBase * data.rates[toCur]);
        };
        const convertedSeat = convert(pricePerSeat, from, to);
        const convertedFee = convert(serviceFeeCAD, 'CAD', to);
        let convertedTotal;
        setConvertedPricePerSeat(convertedSeat); // Always set for display
        if (rideData.payInCash) {
          // Only charge the service fee, but display the real total
          setConvertedServiceFee(convertedFee);
          setConvertedTotal(convertedFee);
          updatePaymentStoreIsCash(true);
          updatePaymentStorePricePerSeat(convertedSeat); // for display
          updatePaymentStoreServiceFee(convertedFee);
          updatePaymentStoreAmount(convertedFee); // for Stripe
          updatePaymentStoreAmountInCents(convertedFee);
          updatePaymentStoreDisplayTotal((seatCount * convertedSeat) + convertedFee); // real total for display/receipt
        } else {
          convertedTotal = (seatCount * convertedSeat) + convertedFee;
          setConvertedServiceFee(convertedFee);
          setConvertedTotal(convertedTotal);
          updatePaymentStoreIsCash(false);
          updatePaymentStorePricePerSeat(convertedSeat);
          updatePaymentStoreServiceFee(convertedFee);
          updatePaymentStoreAmount(convertedTotal);
          updatePaymentStoreAmountInCents(convertedTotal);
          updatePaymentStoreDisplayTotal(convertedTotal);
        }
      }
    }
    if (rideData) fetchRatesAndConvert();
  }, [rideData, userCurrency, seatCount]);

  const currencySymbols = { USD: '$', CAD: 'CA$', INR: '₹' };

  useEffect(() => {
    if (ride.ride) {
      fetchRideData(ride.ride)
    }
  }, [ride])

  // useEffect(() => {
  //   if (rideData) {
  //     updatePaymentStoreAmount((seatCount * paymentStorePricePerSeat) + paymentStoreServiceFee) // Add service fee
  //     updatePaymentStoreAmountInCents((seatCount * paymentStorePricePerSeat) + paymentStoreServiceFee) 
  //   }

  //   console.log(paymentStoreServiceFee, 'fee')
  //   console.log(paymentStoreAmount, 'payment store amount')
  //   console.log(paymentStoreAmountInCents, 'payment store amount in cents')
  // }, [seatCount, paymentStorePricePerSeat, rideData]);

  useEffect(() => {
    async function fetchBookedUsers() {
      if (!rideData?.id) return;
      // 1. Get all bookings for this ride
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('userId')
        .eq('ride_id', rideData.id);
      if (bookingsError || !bookings) return;
      const userIds = bookings.map(b => b.userId).filter(Boolean);
      if (userIds.length === 0) { setBookedUsers([]); return; }
      // 2. Fetch user details from next_auth.users
      const { data: users, error: usersError } = await supabase
        .schema('next_auth')
        .from('users')
        .select('id, name, image, sex')
        .in('id', userIds);
      if (usersError || !users) { setBookedUsers([]); return; }
      // 3. Display users in the same order as bookings
      const usersById = Object.fromEntries(users.map(u => [u.id, u]));
      setBookedUsers(userIds.map(uid => usersById[uid]).filter(Boolean));
    }
    if (rideData) fetchBookedUsers();
  }, [rideData]);

  async function fetchRideData(rideId) {
    let { data: ride, error } = await supabase
      .from('rides')
      .select('*')
      .eq('id', rideId)
      .single()

    if (error) {
      console.log(error)
    } else {
      ride.rideDistanceKm = (ride.rideDistanceMeters / 1000).toFixed(2)
      ride.rideDuration = ride.rideDuration.text
      ride.departureDate = format(new Date(ride.departure), 'MMMM d, yyyy')
      ride.departureTime = format(new Date(ride.departure), 'p')

      setRideData(ride)
      fetchUserData(ride.createdByUser);
      updatePaymentStorePricePerSeat(ride.pricePerSeat)
      updatePaymentStoreAmount(ride.pricePerSeat)
      updatePaymentStoreAmountInCents(ride.pricePerSeat)
      updatePaymentStorePaymentStoreSeatLimit(ride.seats)
      setLoading(false)

      // Fetch driver's stripe_connect_id
      const { data: driver, error: driverError } = await supabase.schema('next_auth')
        .from('users')
        .select('stripe_connect_id')
        .eq('id', ride.createdByUser)
        .single();
      if (!driverError && driver?.stripe_connect_id) {
        setDriverStripeConnectId(driver.stripe_connect_id);
      }

      // Fetch vehicle info if available
      if (ride.vehicle_id) {
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', ride.vehicle_id)
          .single();
        if (!vehicleError) setVehicle(vehicleData);
      } else {
        setVehicle(null);
      }
    }
  }

  async function fetchUserData(uid) {
    let { data: user, error } = await supabase.schema('next_auth')
      .from('users')
      .select('name, image')
      .eq('id', uid)
      .single()

    if (error) {
      console.error(error);
    } else {
      setUserData(user);
      setLoading(false);
    }

    return user
  }

  const incrementSeatCount = () => {
    if (seatCount < rideData.seats) {
      setSeatCount(seatCount + 1);
      updatePaymentStoreAmount(((seatCount + 1) * paymentStorePricePerSeat) + paymentStoreServiceFee)
      updatePaymentStoreAmountInCents(((seatCount + 1) * paymentStorePricePerSeat) + paymentStoreServiceFee)
      updatePaymentStoreSeatCountIncrement()
    }
  };

  const decrementSeatCount = () => {
    if (seatCount > 1) {
      setSeatCount(seatCount - 1);
      updatePaymentStoreAmount(((seatCount - 1) * paymentStorePricePerSeat) + paymentStoreServiceFee)
      updatePaymentStoreAmountInCents(((seatCount - 1) * paymentStorePricePerSeat) + paymentStoreServiceFee)
      updatePaymentStoreSeatCountDecrement()
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trip Details */}
          <div className="lg:col-span-2 space-y-6 drop-shadow-md">
            <div className="bg-gray-300 rounded-xl shadow-sm p-6 animate-pulse">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-400"></div>
                <div>
                  <div className="h-6 bg-gray-400 rounded w-32 mb-2"></div>
                  <div className="flex items-center space-x-1">
                    <div className="h-4 bg-gray-400 rounded w-20"></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gray-400 rounded-full mt-1"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-400 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-400 rounded w-1/2"></div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                  <div className="h-4 bg-gray-400 rounded w-1/2"></div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                  <div className="h-4 bg-gray-400 rounded w-1/2"></div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                  <div className="h-4 bg-gray-400 rounded w-1/2"></div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                  <div className="h-4 bg-gray-400 rounded w-1/2"></div>
                </div>
              </div>
            </div>

            {/* Trip Description */}
            <div className="bg-gray-300 rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-400 rounded w-32 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-400 rounded w-full"></div>
                <div className="h-4 bg-gray-400 rounded w-full"></div>
                <div className="h-4 bg-gray-400 rounded w-full"></div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-gray-300 rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-400 rounded w-32 mb-4"></div>
              <div className="space-y-6">
                <div className="flex items-center space-x-4 pb-4 border-b">
                  <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-400 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-400 rounded w-1/2"></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-gray-400 rounded-full mt-1"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-400 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-400 rounded w-1/2"></div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-gray-400 rounded-full mt-1"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-400 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-400 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="h-4 bg-gray-400 rounded w-full"></div>
                  <div className="h-4 bg-gray-400 rounded w-full"></div>
                  <div className="h-4 bg-gray-400 rounded w-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Panel */}
          <div className="lg:col-span-1 drop-shadow-md">
            <div className="bg-gray-300 rounded-xl shadow-sm p-6 sticky top-8 animate-pulse">
              <div className="text-center mb-6">
                <div className="h-8 bg-gray-400 rounded w-16 mx-auto"></div>
                <div className="h-4 bg-gray-400 rounded w-24 mx-auto mt-2"></div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <div className="h-4 bg-gray-400 rounded w-16"></div>
                  <div className="h-4 bg-gray-400 rounded w-8"></div>
                </div>

                <div className="flex justify-between text-sm">
                  <div className="h-4 bg-gray-400 rounded w-16"></div>
                  <div className="h-4 bg-gray-400 rounded w-8"></div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold">
                    <div className="h-4 bg-gray-400 rounded w-16"></div>
                    <div className="h-4 bg-gray-400 rounded w-8"></div>
                  </div>
                </div>
              </div>

              <div className="h-10 bg-gray-400 rounded w-full"></div>

              <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
                <div className="w-4 h-4 bg-gray-400 rounded-full mr-2"></div>
                <div className="h-4 bg-gray-400 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }


  const handleBookNow = async () => {
    if (!session || !session?.user) {
      redirect("/api/auth/signin")
    } else {
      setIsBookingInProgress(true);
      try {
        if (paymentSectionRef.current) {
          const error = await paymentSectionRef.current.handlePayment();

          if (error) {
            setIsBookingInProgress(false);
          }
        }
      } catch (error) {
        console.error("Payment process failed:", error);
        setIsBookingInProgress(false);
      }
    }    
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trip Details */}
        <div className="lg:col-span-2 space-y-6 drop-shadow-md">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={userData?.image || '/default-user-icon.png'}
                alt="Driver profile"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold">{userData?.name?.split(" ")[0] || "Driver"}'s Trip</h2>
                <DriverRatingDisplay driverId={rideData?.createdByUser} />
                <Link 
                  href={`/drivers/${rideData?.createdByUser}`}
                  className="text-sm text-amber-600 hover:text-amber-800"
                >
                  View driver profile
                </Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-6 h-6 text-gray-400 mt-1" />
                <div>
                  <div className="font-medium">{rideData.startingCity} to {rideData.ishaYogaCenter}</div>
                  <div className="text-gray-500">{rideData.rideDistanceKm} km · {rideData.rideDuration}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-gray-400" />
                <div className="font-medium">{rideData.departureDate}</div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-gray-400" />
                <div className="font-medium">Departure at {rideData.departureTime}</div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-gray-400" />
                <div className="font-medium">{rideData.seatsRemaining} seats available</div>
              </div>

              {vehicle && (
                <div className="flex items-center space-x-3 mt-2">
                  <Car className="w-6 h-6 text-gray-400" />
                  <div className="flex items-center space-x-3">
                    {vehicle.image_url && (
                      <img src={vehicle.image_url} alt="Vehicle" className="w-16 h-10 object-cover rounded border" />
                    )}
                    <div className="font-medium">
                      {vehicle.year} {vehicle.make} {vehicle.model}{vehicle.color ? ` · ${vehicle.color}` : ''}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trip Description */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Trip details</h3>
            <p className="text-gray-600">
              {rideData.description}
            </p>
          </div>

          {/* Driver Reviews Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Driver Reviews</h3>
            <DriverReviews driverId={rideData?.createdByUser} />
          </div>

          {/* Passengers Booked Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Passengers Booked</h3>
            {bookedUsers.length === 0 ? (
              <div className="text-gray-500">No bookings yet for this ride.</div>
            ) : (
              <div className="space-y-3">
                {bookedUsers.map((user, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow transition-shadow"
                  >
                    <img
                      src={user.image || '/default-user-icon.png'}
                      alt={user.name || 'Passenger'}
                      className="w-12 h-12 rounded-full object-cover border border-gray-300 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 font-medium truncate text-gray-900">
                        {user.name || 'Anonymous'}
                        {user.sex && (
                          <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 font-semibold align-middle">
                            {user.sex}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="space-y-6">
              {(convertedTotal && convertedTotal > 0) ? (
                <Elements 
                  stripe={stripePromise}
                  options={{
                    mode: 'payment',
                    amount: Math.round(convertedTotal * 100), // Stripe expects amount in cents/paise
                    currency: userCurrency.toLowerCase(),
                    on_behalf_of: driverStripeConnectId
                  }}>
                  <PaymentSection 
                    ref={paymentSectionRef} 
                    totalPrice={Math.round(convertedTotal * 100)}
                    currency={userCurrency.toLowerCase()}
                    tripSummary={rideData}
                    serviceFee={convertedServiceFee}
                    pricePerSeat={paymentStorePricePerSeat}
                    seats={seatCount}
                    session={session}
                  />
                </Elements>
              ) : (
                <div className="text-red-600 font-semibold">Error: Payment amount must be greater than 0. Please contact support.</div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Panel */}
        <div className="lg:col-span-1 drop-shadow-md">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-black">
                {convertedPricePerSeat !== null ? `${currencySymbols[userCurrency] || userCurrency}${convertedPricePerSeat}` : '...'}
              </div>
              <div className="text-gray-500">per seat</div>
              {rideData?.payInCash && (
                <div className="mt-2 text-xs text-amber-600 font-medium">
                  This ride is paid in cash to the driver
                </div>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span>Seats</span>
                <div className="flex space-x-2">
                  <button onClick={decrementSeatCount} className="w-8 h-8 rounded-full border border-gray-300 hover:border-slate-600 transition-all duration-300">-</button>
                  <span className="w-8 h-8 flex items-center justify-center">{seatCount}</span>
                  <button onClick={incrementSeatCount} className="w-8 h-8 rounded-full border border-gray-300 hover:border-slate-600 transition-all duration-300">+</button>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span>Service fee</span>
                <span>{convertedServiceFee !== null ? `${currencySymbols[userCurrency] || userCurrency}${convertedServiceFee}` : '...'}</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{convertedTotal !== null ? `${currencySymbols[userCurrency] || userCurrency}${convertedTotal}` : '...'}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleBookNow} 
              disabled={isBookingInProgress}
              className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-500 font-medium transition-all duration-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isBookingInProgress ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Processing...
                </div>
              ) : (
                "Book now"
              )}
            </button>

            <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
              <Shield className="w-4 h-4 mr-2" />
              Secure booking · Money-back guarantee
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page