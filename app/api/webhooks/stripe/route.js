import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';
import { addDays, format } from 'date-fns';
import { formatCurrency } from '@/utils/utils';

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

    // console.log(`✅ Event received: ${event.type}`);

    const handlePaymentComplete = async (paymentIntent, supabase) => {
      
    }

    // if (event.type === 'payment_intent.created') {
    //   const paymentIntent = event.data.object;

    //   console.log(paymentIntent, 'paymentIntent created data object')
    // }

    // Handle payment_intent.succeeded event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const supabase = await createClient();

      const metadata = paymentIntent.metadata

      const id = metadata.rideId
      const startingCity = metadata.startingCity
      const ishaYogaCenter = metadata.ishaYogaCenter
      const userEmail = metadata.userEmail
      const departure = metadata.departureTime
      const driverId = metadata.driverId
      const seats = metadata.seats
      const amount = paymentIntent.amount
      const serviceFee = metadata.serviceFee
      const pricePerSeat = metadata.pricePerSeat
      const rideDuration = metadata.duration
      const distance = metadata.distance
      const userName = metadata.user
      const userId = metadata.userId
      const baseUrl = process.env.BASE_URL
      const currency = paymentIntent.currency
      const payInCash = metadata.payInCash === 'true';
      let displayTotal;
      if (payInCash) {
        displayTotal = (pricePerSeat * seats) + Number(serviceFee);
      } else {
        displayTotal = amount / 100;
      }

      // console.log(amount, 'webhook success amount')
      // console.log(currency, 'webhook success currency')

      const { data: existingBooking, error: fetchError } = await supabase
        .from('bookings')
        .select('payment_intent')
        .eq('payment_intent', paymentIntent)
        .maybeSingle();

      if (existingBooking) {
        return NextResponse.json({ received: true });
      }

      if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }

      // Get driver's name
      const { data: driver, error: driverError } = await supabase
        .schema('next_auth')
        .from('users')
        .select('name')
        .eq('id', driverId)
        .single();

      if (driverError) {
        console.error('Error fetching driver:', driverError);
        return NextResponse.json({ error: 'Error fetching driver' }, { status: 500 });
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            payment_intent: paymentIntent.id,
            charge_id: paymentIntent.latest_charge,
            ride_id: id,
            userId,
            seats_booked: seats,
            totalPrice: (amount / 100).toFixed(2),
            currency
          },
        ])
        .select()

      if (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const { error: updateError } = await supabase
        .rpc('decrement_remaining_seats', { ride_id: id, seats_booked: seats })
        .single()

      const response = await fetch(`${baseUrl}/api/send-ride-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail, // Make sure to get user's email from session
          tripDetails: {
            startingCity: startingCity,
            ishaYogaCenter: ishaYogaCenter,
            rideDate: format(departure, 'PP'),
            rideTime: format(departure, 'p'),
            rideDuration,
            rideDistanceKm: distance,
            seatsBooked: seats,
            pricePerSeat: pricePerSeat,
            totalAmount: displayTotal,
            paymentIntent: paymentIntent.id,
            driverName: driver.name,
            userName,
            currency,
            serviceFee,
            payInCash
          }
        })
      });

      if (!response.ok) {
        console.error('Failed to send receipt email', response);
        return NextResponse.json({ error: 'Failed to send receipt email' }, { status: 500 });
      } else if (response.ok) {
        console.log('email sent')
      }
      return NextResponse.json({ received: true });
    }

    if (event.type === 'transfer.created') {
      const transfer = event.data.object;
      // console.log(transfer, 'transfer created event object');

      // Find the corresponding booking using source_transaction (charge ID)
      const supabase = await createClient();
      let booking = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (!booking && retryCount < maxRetries) {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('charge_id', transfer.source_transaction)
          .single();

        if (data) {
          booking = data;
          // console.log(booking, 'booking data')
          break;
        }

        // Wait before retrying
        retryCount++;
        if (retryCount < maxRetries) {
          // console.log(`Booking not found, retry ${retryCount}/${maxRetries} for charge: ${transfer.source_transaction}`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (!booking) {
        // console.log(`No booking found for charge: ${transfer.source_transaction}`);
        return NextResponse.json({ error: 'No booking found for charge' }, { status: 404 });
      }

      if (booking) {
        // Get ride information
        const { data: ride, error: rideError } = await supabase
          .from('rides')
          .select('*, createdByUser')
          .eq('id', booking.ride_id)
          .single();

        if (rideError) {
          // console.error('Error fetching ride:', rideError);
          return NextResponse.json({ error: 'Error fetching ride' }, { status: 500 });
        }

        // Get user information
        const { data: user, error: userError } = await supabase.schema('next_auth')
          .from('users')
          .select('name, email')
          .eq('id', booking.userId)
          .single();

        if (userError) {
          console.error('Error fetching user:', userError);
          return NextResponse.json({ error: 'Error fetching user' }, { status: 500 });
        }

        // Get driver information
        const { data: driver, error: driverError } = await supabase.schema('next_auth')
          .from('users')
          .select('name, email')
          .eq('id', ride.createdByUser)
          .single();

        if (driverError) {
          console.error('Error fetching driver:', driverError);
          return NextResponse.json({ error: 'Error fetching driver' }, { status: 500 });
        }

        // Create robust metadata for the transfer
        const transferMetadata = {
          departureLocation: ride.startingCity,
          destinationLocation: ride.ishaYogaCenter,
          departureTime: ride.departure,
          bookingId: booking.id,
          rideId: ride.id,
          userId: booking.userId,
          seatsBooked: booking.seats_booked,
          userEmail: user.email,
          driverId: ride.createdByUser,
          driverEmail: driver.email,
        };

        // Idempotency: Only update if not already set
        try {
          const currentTransfer = await stripe.transfers.retrieve(transfer.id);
          let needsUpdate = false;
          for (const key in transferMetadata) {
            if (!currentTransfer.metadata || currentTransfer.metadata[key] !== String(transferMetadata[key])) {
              needsUpdate = true;
              break;
            }
          }
          if (needsUpdate) {
            await stripe.transfers.update(
              transfer.id,
              { metadata: transferMetadata }
            );
            // console.log('Transfer metadata updated successfully:', transfer.id);
          } else {
            console.log('Transfer metadata already up to date:', transfer.id);
          }

          // Update the booking to indicate the transfer was processed
          await supabase
            .from('bookings')
            .update({
              transfer_id: transfer.id,
              status: 'completed'
            })
            .eq('id', booking.id);
          return NextResponse.json({ received: true });
        } catch (updateError) {
          // console.error('Error updating transfer metadata:', updateError);
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
      }
    }

    // Handle other events as needed

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('⚠️ Webhook error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}