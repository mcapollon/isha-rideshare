import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';
import { addDays } from 'date-fns';

// Strip signature verification middleware
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = request.headers.get('stripe-signature');
  
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    console.log(`✅ Event received: ${event.type}`);
    
    // Handle payment_intent.succeeded event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      const supabase = await createClient();
      
      // 1. Find the booking associated with this payment intent
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*, rides(*)')
        .eq('payment_intent', paymentIntent.id)
        .single();
      
      if (bookingError || !booking) {
        console.error('⚠️ Booking not found for payment:', paymentIntent.id, bookingError);
        return NextResponse.json({ error: 'Booking not found' }, { status: 400 });
      }
      
      // 2. Calculate payout details
      const totalAmount = booking.totalPrice * 100; // Convert dollars to cents
      const platformFeePercent = 15; // 15% platform fee
      const platformFee = Math.round(totalAmount * (platformFeePercent / 100));
      const payoutAmount = totalAmount - platformFee;
      
      // Instead of creating a transfer now, schedule one for later
      const scheduledDate = addDays(new Date(), 3);
      
      // Create a record in a 'scheduled_transfers' table
      await supabase
        .from('scheduled_transfers')
        .insert({
          amount: payoutAmount,
          platform_fee: platformFee,
          ride_id: booking.rides.id,
          booking_id: booking.id,
          user_id: booking.user_id,
          driver_id: booking.rides.createdByUser,
          stripe_connect_id: booking.rides.driver_stripe_connect_id,
          payment_intent_id: paymentIntent.id,
          charge_id: paymentIntent.charges?.data[0]?.id,
          scheduled_for: scheduledDate.toISOString(),
          status: 'scheduled',
          metadata: {
            departureLocation: booking.rides.startingCity,
            destination: booking.rides.ishaYogaCenter,
            departureTime: booking.rides.departure
          }
        });
      
      // Update the booking with schedule information
      await supabase
        .from('bookings')
        .update({ 
          transfer_scheduled: true,
          platform_fee: platformFee / 100,
          driver_amount: payoutAmount / 100,
          transfer_scheduled_for: scheduledDate.toISOString()
        })
        .eq('id', booking.id);
    }
    
    // Handle other events as needed
    
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('⚠️ Webhook error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}