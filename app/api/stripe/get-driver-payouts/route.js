import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { auth } from '@/auth';
import Stripe from 'stripe';
import { addDays } from 'date-fns';

export async function GET(request) {
  try {
    // Authorization check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const supabase = await createClient();
    
    // Get the user's Stripe Connect ID
    const { data: user, error: userError } = await supabase.schema('next_auth')
      .from('users')
      .select('stripe_connect_id, stripe_onboarding_complete')
      .eq('id', session.user.id)
      .single();
    
    if (userError || !user?.stripe_connect_id) {
      return NextResponse.json(
        { error: 'Stripe Connect account not found' }, 
        { status: 404 }
      );
    }
    
    if (!user.stripe_onboarding_complete) {
      return NextResponse.json(
        { error: 'Stripe onboarding not complete' },
        { status: 400 }
      );
    }
    
    // Get transfers - Stripe doesn't support status filtering on transfers
    // Instead, we'll fetch all recent transfers and filter them ourselves
    const [transfers, balance] = await Promise.all([
      // Get all recent transfers (up to 100)
      stripe.transfers.list({
        destination: user.stripe_connect_id,
        limit: 100,
        expand: ['data.destination_payment']
      }),
      
      // Get current account balance
      stripe.balance.retrieve({
        stripeAccount: user.stripe_connect_id
      })
    ]);
    
    // Manually separate pending from paid transfers
    // A transfer is "pending" if it's created but not yet available in the balance
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const pendingTransfers = transfers.data.filter(t => 
      (t.arrival_date && t.arrival_date > now)
    );
    
    const paidTransfers = transfers.data.filter(t => 
      (!t.arrival_date || t.arrival_date <= now)
    );
    
    // Format the data for our frontend
    const formatTransfer = (transfer) => ({
      id: transfer.id,
      amount: transfer.amount,
      currency: transfer.currency,
      created: transfer.created * 1000, // Convert to milliseconds
      arrival_date: transfer.arrival_date ? transfer.arrival_date * 1000 : null,
      status: transfer.arrival_date > now ? 'pending' : 'paid',
      description: transfer.description || 'Ride payout',
      metadata: transfer.metadata || {},
      // Try to get ride details from metadata if available
      rideDetails: {
        departureLocation: transfer.metadata?.departureLocation || 'Unknown location',
        destination: transfer.metadata?.destination || 'Isha Center',
        departureTime: transfer.metadata?.departureTime ? parseInt(transfer.metadata.departureTime) * 1000 : null
      }
    });
    
    // Get the current balance in the account
    const availableBalance = balance.available.reduce(
      (sum, balItem) => sum + balItem.amount, 
      0
    );
    
    const pendingBalance = balance.pending.reduce(
      (sum, balItem) => sum + balItem.amount, 
      0
    );
    
    return NextResponse.json({
      pending: pendingTransfers.map(formatTransfer),
      completed: paidTransfers.map(formatTransfer),
      balance: {
        available: availableBalance,
        pending: pendingBalance
      },
      stats: {
        pending: pendingTransfers.length,
        completed: paidTransfers.length,
        totalEarned: paidTransfers.reduce((sum, t) => sum + t.amount, 0)
      }
    });
    
  } catch (error) {
    console.error('Error fetching Stripe payouts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payouts' }, 
      { status: 500 }
    );
  }
}