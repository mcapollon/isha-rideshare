import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

export async function POST(request) {
  // Verify this is a legitimate cron job request
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET_TOKEN}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const supabase = await createClient();
    
    // Get all scheduled transfers that are due today
    const now = new Date();
    const { data: scheduledTransfers, error } = await supabase
      .from('scheduled_transfers')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now.toISOString());
    
    if (error) {
      console.error('Error fetching scheduled transfers:', error);
      return NextResponse.json({ error: 'Failed to fetch scheduled transfers' }, { status: 500 });
    }
    
    // console.log(`Found ${scheduledTransfers.length} transfers to process`);
    
    // Process each scheduled transfer
    const results = await Promise.all(
      scheduledTransfers.map(async (scheduled) => {
        try {
          // Create the transfer in Stripe
          const transfer = await stripe.transfers.create({
            amount: scheduled.amount,
            currency: 'cad',
            destination: scheduled.stripe_connect_id,
            transfer_group: `ride_${scheduled.ride_id}`,
            source_transaction: scheduled.charge_id,
            metadata: {
              rideId: scheduled.ride_id.toString(),
              bookingId: scheduled.booking_id.toString(),
              departureLocation: scheduled.metadata.departureLocation,
              destination: scheduled.metadata.destination,
              departureTime: Math.floor(new Date(scheduled.metadata.departureTime).getTime() / 1000).toString(),
              passengerId: scheduled.user_id,
              platformFee: scheduled.platform_fee.toString()
            }
          });
          
          // Update the scheduled transfer status
          await supabase
            .from('scheduled_transfers')
            .update({ 
              status: 'completed',
              stripe_transfer_id: transfer.id,
              processed_at: new Date().toISOString()
            })
            .eq('id', scheduled.id);
          
          return {
            id: scheduled.id,
            status: 'completed',
            transfer_id: transfer.id
          };
        } catch (err) {
          console.error(`Error processing transfer ${scheduled.id}:`, err);
          
          // Mark as failed
          await supabase
            .from('scheduled_transfers')
            .update({ 
              status: 'failed',
              error_message: err.message
            })
            .eq('id', scheduled.id);
          
          return {
            id: scheduled.id,
            status: 'failed',
            error: err.message
          };
        }
      })
    );
    
    return NextResponse.json({
      processed: results.length,
      succeeded: results.filter(r => r.status === 'completed').length,
      failed: results.filter(r => r.status === 'failed').length,
      results
    });
    
  } catch (error) {
    console.error('Error processing scheduled transfers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}