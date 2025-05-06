import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

export async function POST(request) {
  try {
    const { amount, session, rideData, seats, currency, pricePerSeat, serviceFee, payInCash } = await request.json();
    // console.log(pricePerSeat, 'payment intent price per seat')
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
    
    // Calculate platform fee and amount correctly
    let platformFee;
    let paymentAmount;
    const rideFare = pricePerSeat * seats; // ride fare only
    if (payInCash) {
      // Only charge the service fee for cash rides
      platformFee = Math.round(serviceFee * 100); // Stripe expects cents
      paymentAmount = Math.round(serviceFee * 100); // Only service fee is charged
    } else {
      // 10% of ride fare + service fee
      platformFee = Math.round((rideFare * 0.10 + serviceFee) * 100); // cents
      paymentAmount = Math.round((rideFare + serviceFee) * 100); // total amount in cents
    }

    console.log(platformFee, 'platform fee');
    console.log(paymentAmount, 'payment amount');

    // Create a payment intent with Connect destination and application fee
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentAmount,
      currency: currency,
      application_fee_amount: platformFee,
      transfer_data: {
        destination: driver.stripe_connect_id,
      },
      automatic_payment_methods: { enabled: true },
      on_behalf_of: driver.stripe_connect_id, // Removed as not required for destination charges
      metadata: {
        rideId: rideId,
        driverId: ride.createdByUser,
        platformFee: platformFee,
        stripeConnectId: driver.stripe_connect_id, // Store for webhook
        driverAmount: paymentAmount - platformFee, // Store for webhook
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