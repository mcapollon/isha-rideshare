"use client"
import React, { useEffect, useState, use, useRef } from 'react'
import { createClient } from "@/utils/supabase/client"
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, DollarSign, MessageCircle, Star, Car, Shield, CreditCard, Lock, CheckCircle } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentSection from '@/components/book/paymentSection';


if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("Stripe Public Key is not defined")
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)

function page({ params }) {

  const ride = use(params)
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [rideData, setRideData] = useState(null)
  const [userData, setUserData] = useState(null);
  const [seatCount, setSeatCount] = useState(1);
  const [totalPrice, setTotalPrice] = useState(1)
  const [totalPriceSubUnit, setTotalPriceSubUnit] = useState(1)
  const [pricePerSeat, setPricePerSeat] = useState(1)

  const paymentSectionRef = useRef();

  useEffect(() => {
    if (ride.ride) {
      fetchRideData(ride.ride)
    }
  }, [ride])

  useEffect(() => {
    if (rideData) {
      const newTotal = (seatCount * pricePerSeat) + 3; // Add service fee
      setTotalPrice(newTotal);
      setTotalPriceSubUnit(newTotal * 100); // Convert to cents for Stripe
    }
  }, [seatCount, pricePerSeat, rideData]);

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
      setPricePerSeat(ride.pricePerSeat)
      setTotalPrice(ride.pricePerSeat)
      setTotalPriceSubUnit(ride.pricePerSeat)
      console.log(totalPriceSubUnit)
      setLoading(false)
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
      setTotalPrice(seatCount * pricePerSeat)
      console.log(totalPrice)
    }
  };

  const decrementSeatCount = () => {
    if (seatCount > 1) {
      setSeatCount(seatCount - 1);
      setTotalPrice(seatCount * pricePerSeat)
      console.log(totalPrice)
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
    if (paymentSectionRef.current) {
      await paymentSectionRef.current.handlePayment();
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
                src={userData?.image}
                alt="Driver profile"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold">{userData?.name.split(" ")[0]}'s Trip</h2>
                <div className="flex items-center space-x-1 text-yellow-400">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <span className="text-gray-600 text-sm ml-1">(48 reviews)</span>
                </div>
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
                <div className="font-medium">{rideData.seats} seats available</div>
              </div>

              {/* // TODO Need to collect vehicule information during ride creation */}
              {/* <div className="flex items-center space-x-3">
                <Car className="w-6 h-6 text-gray-400" />
                <div className="font-medium">Tesla Model 3 (2022) · White</div>
              </div> */}
            </div>
          </div>

          {/* Trip Description */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Trip details</h3>
            <p className="text-gray-600">
              {rideData.description}
            </p>
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">

            {/* Payment Methods */}
            <div className="space-y-6">

              {/* Payment Process */}
              <Elements 
                stripe={stripePromise}
                options={{
                  mode: 'payment',
                  amount: totalPriceSubUnit,
                  currency: 'cad'
                }}>
                <PaymentSection 
                  ref={paymentSectionRef} 
                  totalPrice={totalPriceSubUnit} 
                  onPaymentComplete={() => {
                    console.log('Payment Completed')
                  }} />
              </Elements>
            </div>
          </div>
        </div>

        {/* Booking Panel */}
        <div className="lg:col-span-1 drop-shadow-md">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-black">${rideData.pricePerSeat}</div>
              <div className="text-gray-500">per seat</div>
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
                <span>$3</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
            </div>

            <button onClick={handleBookNow} className="w-full bg-black text-white py-3 rounded-lg hover:bg-slate-800 font-medium transition-all duration-500">
              Book now
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

export default page