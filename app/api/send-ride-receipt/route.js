import { resend } from '@/lib/resend'
import RideReceiptEmail from '@/emails/ride-receipt-email'
import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const { 
            email,
            tripDetails: {
                startingCity,
                ishaYogaCenter,
                rideDate,
                rideTime,
                rideDuration,
                rideDistanceKm,
                seatsBooked,
                pricePerSeat,
                totalAmount,
                paymentIntent,
                driverName,
                userName,
                currency,
                serviceFee
            }
        } = await request.json()

        const data = await resend.emails.send({
            from: 'no-reply@mckinsleyapollon.com',
            to: email,
            subject: 'Your Ride Booking Confirmation',
            react: RideReceiptEmail({
                startingCity: startingCity,
                destination: ishaYogaCenter,
                rideDate: rideDate,
                rideTime: rideTime,
                duration: rideDuration,
                distance: rideDistanceKm,
                seatsBooked: seatsBooked,
                pricePerSeat: typeof pricePerSeat === 'string' ? pricePerSeat.replace(/[^\d.]/g, '') : pricePerSeat,
                totalAmount: typeof totalAmount === 'string' ? totalAmount.replace(/[^\d.]/g, '') : totalAmount,
                paymentIntent: paymentIntent,
                driverName: driverName,
                userName: userName,
                currency,
                serviceFee
            })
        })

        return NextResponse.json({ success: true, data })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to send receipt email' },
            { status: 500 }
        )
    }
}


