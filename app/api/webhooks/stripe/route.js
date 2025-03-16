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
      
      // Implement a retry mechanism for finding the booking
      let booking = null;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (!booking && retryCount < maxRetries) {
        // Try to find the booking
        const { data, error } = await supabase
          .from('bookings')
          .select('*, rides(*)')
          .eq('payment_intent', paymentIntent.id)
          .single();
        
        if (data) {
          booking = data;
          break; // Found it!
        }
        
        // Wait a bit before retrying
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`Booking not found, retry ${retryCount}/${maxRetries} for payment: ${paymentIntent.id}`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        }
      }
      
      // If still not found after retries, store the event for later processing
      if (!booking) {
        console.log('⚠️ Booking not found after retries, storing event for later processing:', paymentIntent.id);
        
        // Store the unprocessed payment in a separate table
        await supabase.from('unprocessed_payments').insert({
          payment_intent_id: paymentIntent.id,
          payment_data: paymentIntent,
          event_type: event.type,
          processed: false,
          created_at: new Date().toISOString()
        });
        
        // Return success to Stripe (we'll process this later)
        return NextResponse.json({ received: true });
      }
      
      // 2. Calculate payout details
      const totalAmount = booking.totalPrice * 100; // Convert dollars to cents
      const platformFeePercent = 10; // 15% platform fee
      const platformFee = Math.round(totalAmount * (platformFeePercent / 100));
      const payoutAmount = totalAmount - platformFee;
      
      // Instead of creating a transfer now, schedule one for later
      const scheduledDate = addDays(new Date(), 3);
      
      // Create a record in a 'scheduled_transfers' table
      // Create a record in a 'scheduled_transfers' table
      const { data: scheduleData, error: scheduleError } = await supabase
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
        })
        .select()
        .single();
      
      if (scheduleError) {
        console.error('Error scheduling transfer:', scheduleError);
        throw new Error(`Failed to schedule transfer: ${scheduleError.message}`);
      }
      
      console.log(`Transfer scheduled successfully with ID: ${scheduleData?.id}`);
      
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

    if (event.type === 'transfer.created') {
      console.log(event.data.object, 'transfer created event object')
    }
    
    // Handle other events as needed
    
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('⚠️ Webhook error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}