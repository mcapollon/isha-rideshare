// New file: /app/api/cron/process-payouts/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

// This endpoint should be secured and only callable by a cron service
export async function POST(request) {
  // Check for a secret token to ensure this is called by your cron service
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET_TOKEN}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = await createClient();
  
  // Find all scheduled payouts that are due
  const now = new Date();
  const { data: duePayouts, error } = await supabase
    .from('payouts')
    .select('*')
    .eq('status', 'scheduled')
    .filter('scheduled_for', 'lte', now.toISOString());
    
  if (error) {
    console.error('Error fetching due payouts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Process each due payout
  const results = await Promise.all(duePayouts.map(async (payout) => {
    try {
      // Create a transfer to the connected account
      const transfer = await stripe.transfers.create({
        amount: payout.amount,
        currency: 'cad',
        destination: payout.stripe_connect_id,
        metadata: {
          ride_id: payout.ride_id,
          payout_id: payout.id
        }
      });
      
      // Update payout record
      await supabase
        .from('payouts')
        .update({
          status: 'paid',
          transfer_id: transfer.id
        })
        .eq('id', payout.id);
        
      return {
        id: payout.id,
        success: true,
        transfer_id: transfer.id
      };
    } catch (err) {
      console.error(`Error processing payout ${payout.id}:`, err);
      
      // Update payout record with failed status
      await supabase
        .from('payouts')
        .update({
          status: 'failed',
          metadata: {
            ...payout.metadata,
            error: err.message
          }
        })
        .eq('id', payout.id);
        
      return {
        id: payout.id,
        success: false,
        error: err.message
      };
    }
  }));
  
  return NextResponse.json({
    processed: results.length,
    results
  });
}