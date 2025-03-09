// New file: /app/api/webhooks/stripe/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';
import { buffer } from 'micro';
import { addDays } from 'date-fns';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = await createClient();
  
  // Get the Stripe signature from headers
  const signature = request.headers.get('stripe-signature');
  
  // Parse the raw body
  const rawBody = await buffer(request);
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  // Handle specific events
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    // Schedule payout for 3 days later
    const payoutDate = addDays(new Date(), 3);
    
    // Record the scheduled payout
    await supabase.from('payouts').insert({
      ride_id: paymentIntent.metadata.rideId,
      driver_id: paymentIntent.metadata.driverId,
      amount: paymentIntent.amount - paymentIntent.metadata.platformFee,
      platform_fee: paymentIntent.metadata.platformFee,
      status: 'scheduled',
      scheduled_for: payoutDate.toISOString(),
      metadata: {
        payment_intent_id: paymentIntent.id,
      }
    });
    
    // Update the booking to mark transfer as scheduled
    await supabase.from('bookings')
      .update({ transfer_scheduled: true })
      .eq('payment_intent', paymentIntent.id);
  }
  
  return NextResponse.json({ received: true });
}