import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';
import { resend } from '@/lib/resend';
import RefundNotificationEmail from '@/emails/ride-refund-email';
import { format } from 'date-fns';

export async function POST(request) {
  try {
    const { rideId } = await request.json();
    
    // Initialize Stripe and Supabase
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const supabase = await createClient();
    
    // Get the ride details first
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select('*')
      .eq('id', rideId)
      .single();
      
    if (rideError) {
      console.error('Error fetching ride:', rideError);
      return NextResponse.json({ success: false, error: rideError.message }, { status: 500 });
    }
    
    // Get all bookings for this ride
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('ride_id', rideId);
      
    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // If we have bookings, fetch user details separately
    const bookingsWithUsers = await Promise.all(bookings.map(async (booking) => {
      if (!booking.userId) return booking;
      
      const { data: user } = await supabase.schema('next_auth')
        .from('users')
        .select('name, email')
        .eq('id', booking.userId)
        .single();
        
      return {
        ...booking,
        user: user || null
      };
    }));

    if (!bookingsWithUsers || bookingsWithUsers.length === 0) {
      return NextResponse.json({ success: true, message: 'No bookings found for this ride', results: [] });
    }
    
    // Process refunds for each booking
    const results = await Promise.all(bookingsWithUsers.map(async (booking) => {
      try {
        // Skip if no payment_intent or already refunded
        if (!booking.payment_intent || booking.status === 'refunded') {
          return { 
            booking_id: booking.id, 
            success: false, 
            message: booking.status === 'refunded' ? 'Already refunded' : 'No payment intent found' 
          };
        }
        
        // Create refund in Stripe
        const refund = await stripe.refunds.create({
          payment_intent: booking.payment_intent,
          reason: 'requested_by_customer',
        });
        
        // Update booking status in database
        await supabase
          .from('bookings')
          .update({ 
            status: 'refunded', 
            refund_id: refund.id,
            refunded_at: new Date().toISOString()
          })
          .eq('id', booking.id);
        
        // Get the user's email
        const userEmail = booking?.user?.email;
        const userName = booking?.user?.name || 'Rider';
        
        // Only send email if we have the user's email
        if (userEmail) {
          try {
            await resend.emails.send({
              from: 'no-reply@sagnarides.com',
              to: userEmail,
              subject: 'Your Isha RideShare Refund Confirmation',
              react: RefundNotificationEmail({
                userName: userName,
                rideDate: format(new Date(ride.departure), 'MMMM d, yyyy'),
                rideTime: format(new Date(ride.departure), 'p'),
                startingCity: ride.startingCity,
                destination: ride.ishaYogaCenter,
                seatsBooked: booking.seats_booked,
                totalAmount: booking.totalPrice,
                refundId: refund.id,
                paymentIntent: booking.payment_intent,
              })
            });
            // console.log(`Refund email sent to ${userEmail}`);
          } catch (emailError) {
            console.error(`Failed to send refund email to ${userEmail}:`, emailError);
            // Continue with the refund process even if email sending fails
          }
        }
          
        return { 
          booking_id: booking.id, 
          success: true, 
          refund_id: refund.id,
          email_sent: !!userEmail
        };
      } catch (error) {
        console.error(`Refund failed for booking ${booking.id}:`, error);
        return { 
          booking_id: booking.id, 
          success: false, 
          error: error.message 
        };
      }
    }));
    
    return NextResponse.json({ success: true, results });
    
  } catch (error) {
    console.error('Error processing refunds:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}