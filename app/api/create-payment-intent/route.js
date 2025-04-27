import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

export async function POST(request) {
  try {
    const { amount, session, rideData, seats, currency, pricePerSeat, serviceFee, payInCash } = await request.json();
    console.log(pricePerSeat, 'payment intent price per seat')
    let rideId = rideData.id

    if (!amount || !rideId || !session || !seats) {
      return NextResponse.json(
        { error: 'Amount, ride data, session and seats are required' }, 
        { status: 400 }
      );
    }
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const supabase = await createClient();
    
    // Get ride info including driver ID
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select('*, createdByUser')
      .eq('id', rideId)
      .single();
      
    if (rideError || !ride) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
    }
    
    // Get driver's Stripe Connect ID
    const { data: driver, error: driverError } = await supabase.schema('next_auth')
      .from('users')
      .select('stripe_connect_id, stripe_onboarding_complete')
      .eq('id', ride.createdByUser)
      .single();
      
    if (driverError || !driver?.stripe_connect_id) {
      return NextResponse.json({ error: 'Driver account not found' }, { status: 400 });
    }
    
    if (!driver.stripe_onboarding_complete) {
      return NextResponse.json({ error: 'Driver onboarding not completed' }, { status: 400 });
    }
    
    // Calculate platform fee (10%)
    const platformFeePercent = 10;
    const platformFee = amount * (platformFeePercent / 100);

    console.log(ride, 'ride data payment intent')
    
    // Create a payment intent with Connect destination and application fee
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      application_fee_amount: platformFee,
      transfer_data: {
        destination: driver.stripe_connect_id,
      },
      automatic_payment_methods: { enabled: true },
      metadata: {
        rideId: rideId,
        driverId: ride.createdByUser,
        platformFee: platformFee,
        stripeConnectId: driver.stripe_connect_id, // Store for webhook
        driverAmount: amount - platformFee, // Store for webhook
        ishaYogaCenter: ride.ishaYogaCenter,
        startingPointAddress: ride.startingPointAddress,
        startingCity: ride.startingCity,
        destination: ride.ishaYogaCenter,
        departureTime: ride.departure,
        duration: ride.rideDuration.text,
        distance: ride.rideDistanceMeters,
        pricePerSeat: pricePerSeat,       // new: in payment currency
        seats,
        user: session.user.name,
        userId: session.user.id,
        userEmail: session.user.email,
        amount,
        serviceFee,
        payInCash: payInCash ? 'true' : 'false' // Add payInCash to metadata
      }
    });
    
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}