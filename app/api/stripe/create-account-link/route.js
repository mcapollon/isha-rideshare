import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

export async function POST(request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const supabase = await createClient();
    const { userId } = await request.json();

    console.log(userId, 'user id')
    
    // Check if user already has a Stripe account
    const { data: userData, error: userError } = await supabase.schema('next_auth')
      .from('users')
      .select('stripe_connect_id')
      .eq('id', userId)
      .single();
      
    if (userError && userError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    let accountId = userData?.stripe_connect_id;
    
    // If no account exists, create one
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
      });
      
      accountId = account.id;
      
      // Save the account ID to the user record
      await supabase.schema('next_auth')
        .from('users')
        .update({ 
          stripe_connect_id: accountId,
          stripe_onboarding_complete: false,
        })
        .eq('id', userId);
    }
    
    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/driver/onboarding`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/driver/onboarding/success`,
      type: 'account_onboarding',
    });
    
    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.log('Error creating account link:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}