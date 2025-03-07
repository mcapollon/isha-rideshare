"use client"
import React, { useEffect } from 'react'
import Link from 'next/link';
import { CheckCircle, Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation'
import { format } from "date-fns";
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

function Page() {
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const supabase = createClient()

  useEffect(() => {
    if (status !== 'loading' && !session) {
      redirect('/auth/sign-in')
    }
  }, [session, status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const id = searchParams.get('id')
  const paymentIntent = searchParams.get('payment_intent')
  const amount = searchParams.get('amount') / 100
  const pricePerSeat = searchParams.get('pricePerSeat')
  const startingCity = decodeURI(searchParams.get('startingCity'))
  const ishaYogaCenter = decodeURI(searchParams.get('iyc'))
  const departure = format(searchParams.get('departure'), 'PPPPpppp')
  const rideDuration = searchParams.get('duration')
  const rideDistance = searchParams.get('distance')
  const seatsBooked = searchParams.get('seats')

  const handlePaymentComplete = async () => {
    const { data: existingBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('payment_intent')
      .eq('payment_intent', paymentIntent)
      .maybeSingle();

    if (existingBooking) {
      return
    }

    if (fetchError) {
      return
    }

    // Get ride details to find the driver
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select('createdByUser')
      .eq('id', id)
      .single();

    if (rideError) {
      console.error('Error fetching ride:', rideError);
      return;
    }

    // Get driver's name
    const { data: driver, error: driverError } = await supabase
      .schema('next_auth')
      .from('users')
      .select('name')
      .eq('id', ride.createdByUser)
      .single();

    if (driverError) {
      console.error('Error fetching driver:', driverError);
      return;
    }
    
    console.log(driver)

    const response = await fetch('/api/send-ride-receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: session?.user.email, // Make sure to get user's email from session
        tripDetails: {
          startingCity: startingCity,
          ishaYogaCenter: ishaYogaCenter,
          rideDate: format(searchParams.get('departure'), 'PP'),
          rideTime: format(searchParams.get('departure'), 'p'),
          rideDuration: rideDuration,
          rideDistanceKm: rideDistance,
          seatsBooked: seatsBooked,
          pricePerSeat: pricePerSeat,
          totalAmount: amount,
          paymentIntent: paymentIntent,
          driverName: driver.name,
          userName: session?.user.name,
        }
      })
    });

    if (!response.ok) {
      console.error('Failed to send receipt email');
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          payment_intent: paymentIntent,
          ride_id: id,
          userId: session.user.id,
          seats_booked: seatsBooked,
          totalPrice: amount,
        },
      ])
      .select()

    if (error) {
      console.error(error)
    }

    const { error: updateError } = await supabase
      .rpc('decrement_remaining_seats', { ride_id: id, seats_booked: seatsBooked })
      .single()

  }

  useEffect(() => {
    handlePaymentComplete()
  }, [])


  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">Your trip has been successfully booked</p>
          </div>

          {/* Trip Summary */}
          <div className="border rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-lg mb-4">Trip Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">{startingCity} to {ishaYogaCenter}</div>
                  <div className="text-sm text-gray-500">{rideDistance} km · {rideDuration}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div className="font-medium">{departure}</div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div className="font-medium">{seatsBooked} {seatsBooked > 1 ? 'seats' : 'seat'} booked</div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-lg mb-4">Payment Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Seat price</span>
                <span className="font-medium">${pricePerSeat} {seatsBooked > 1 ? `X ${seatsBooked}` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service fee</span>
                <span className="font-medium">$3.00</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Total paid</span>
                  <span className="font-semibold">${amount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-amber-50 rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-lg mb-4">Next Steps</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• Check your email for booking confirmation</li>
              <li>• Contact details for your driver will be shared 24 hours before the trip</li>
              <li>• You can message your driver through the platform for any questions</li>
            </ul>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center text-amber-600 hover:text-amber-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Page
