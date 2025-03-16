import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';
import { addDays } from 'date-fns';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    // Simple API key protection (use a more secure method in production)
    if (authHeader !== `Bearer ${process.env.WEBHOOK_PROCESSING_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = await createClient();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Get unprocessed payments
    const { data: unprocessedPayments } = await supabase
      .from('unprocessed_payments')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: true });
    
    if (!unprocessedPayments?.length) {
      return NextResponse.json({ message: 'No pending payments to process' });
    }
    
    const results = [];
    
    for (const payment of unprocessedPayments) {
      if (payment.event_type === 'payment_intent.succeeded') {
        const paymentIntent = payment.payment_data;
        
        // Try to find the booking now
        const { data: booking } = await supabase
          .from('bookings')
          .select('*, rides(*)')
          .eq('payment_intent', paymentIntent.id)
          .single();
        
        if (booking) {
          // Calculate and process payment like in the webhook
          // Copy your payment processing logic here
          
          // Mark as processed
          await supabase
            .from('unprocessed_payments')
            .update({ processed: true })
            .eq('id', payment.id);
            
          results.push({ id: payment.id, status: 'processed' });
        } else {
          results.push({ id: payment.id, status: 'still-pending' });
        }
      }
    }
    
    return NextResponse.json({ processed: results });
  } catch (error) {
    console.error('Error processing pending payments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}