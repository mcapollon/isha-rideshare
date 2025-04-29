import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { auth } from '@/auth';
import Stripe from 'stripe';

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
    
    // Get both transfers and payouts
    const [transfers, payouts, balance] = await Promise.all([
      // Get transfers (money sent to driver's Stripe account)
      stripe.transfers.list({
        destination: user.stripe_connect_id,
        limit: 50,
        expand: ['data.destination_payment']
      }),
      
      // Get payouts (money sent from Stripe to driver's bank account)
      stripe.payouts.list({
        stripeAccount: user.stripe_connect_id,
        limit: 50
      }),
      
      // Get current account balance
      stripe.balance.retrieve({
        stripeAccount: user.stripe_connect_id
      })
    ]);

    // console.log(transfers, 'transfers')
    
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    
    // Format transfer data
    const formatTransfer = (transfer) => ({
      id: transfer.id,
      amount: transfer.amount,
      currency: transfer.currency,
      created: transfer.created,
      status: 'pending',
      description: transfer.description || 'Ride payout (pending)',
      metadata: transfer.metadata,
      type: 'transfer',
    });
    
    // Format payout data
    const formatPayout = (payout) => ({
      id: payout.id,
      amount: payout.amount,
      currency: payout.currency,
      created: payout.created,
      arrivalDate: payout.arrival_date,
      status: 'completed',
      description: payout.description || 'Bank payout',
      method: payout.method,
      type: 'payout',
      bankAccount: payout.bank_account ? `${payout.bank_account.bank_name} (${payout.bank_account.last4})` : 'Bank account'
    });
    
    // Get balance information
    const availableBalance = balance.available.reduce(
      (sum, balItem) => sum + balItem.amount, 
      0
    );
    
    const pendingBalance = balance.pending.reduce(
      (sum, balItem) => sum + balItem.amount, 
      0
    );
    
    // All transfers are considered "pending" until they move to the bank account
    const pendingTransfers = transfers.data;
    
    // All payouts are considered "completed" as they're already sent to the bank
    const completedPayouts = payouts.data;
    
    return NextResponse.json({
      pending: pendingTransfers.map(formatTransfer),
      completed: completedPayouts.map(formatPayout),
      balance: {
        available: availableBalance,
        pending: pendingBalance
      },
      stats: {
        pending: pendingTransfers.length,
        completed: completedPayouts.length,
        totalEarned: completedPayouts.reduce((sum, p) => sum + p.amount, 0)
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