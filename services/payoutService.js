import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';
import { addDays } from 'date-fns';

export async function schedulePayoutForCompletedRide(booking, rideId, driverId, amount) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = await createClient();
  
  try {
    // Get driver's Stripe Connect ID
    const { data: driver, error: driverError } = await supabase.schema('next_auth')
      .from('users')
      .select('stripe_connect_id')
      .eq('id', driverId)
      .single();
      
    if (driverError || !driver?.stripe_connect_id) {
      console.error('Unable to find driver connect account:', driverError);
      return { success: false, error: 'Driver payout account not found' };
    }
    
    // Calculate platform fee (15%)
    const platformFeePercent = 15;
    const platformFee = Math.round(amount * (platformFeePercent / 100));
    
    // Calculate payout amount (total minus platform fee)
    const payoutAmount = amount - platformFee;
    
    // Schedule payout 3 days in the future
    const payoutDate = addDays(new Date(), 3);
    
    // Create payout record
    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .insert({
        ride_id: rideId,
        driver_id: driverId,
        booking_id: booking.id,
        amount: payoutAmount,
        platform_fee: platformFee,
        status: 'scheduled',
        scheduled_for: payoutDate.toISOString(),
        stripe_connect_id: driver.stripe_connect_id,
        metadata: {
          payment_intent_id: booking.payment_intent,
        }
      })
      .select()
      .single();
      
    if (payoutError) {
      console.error('Failed to create payout record:', payoutError);
      return { success: false, error: payoutError.message };
    }
    
    // Mark the booking as having a transfer scheduled
    await supabase
      .from('bookings')
      .update({ transfer_scheduled: true })
      .eq('id', booking.id);
      
    return { success: true, payout };
    
  } catch (error) {
    console.error('Error scheduling payout:', error);
    return { success: false, error: error.message };
  }
}