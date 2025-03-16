import { createClient } from '@supabase/supabase-js';
import { auth } from '@/auth';
import Stripe from 'stripe';

export async function GET(request) {
  try {
    // Get user session
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log(session.user.id,' session')
    
    // Get driver's Stripe Connect account ID
    const { data: driver, error } = await supabase.schema('next_auth')
      .from('users')
      .select('stripe_connect_id, stripe_onboarding_complete')
      .eq('id', session.user.id)
      .single();
    
    if (error || !driver) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    
    if (!driver.stripe_onboarding_complete || !driver.stripe_connect_id) {
      return Response.json({ 
        error: 'Stripe Connect account not fully set up',
        needsOnboarding: true
      }, { status: 400 });
    }
    
    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Create login link for the Connect account
    const loginLink = await stripe.accounts.createLoginLink(
      driver.stripe_connect_id
    );
    
    return Response.json({ url: loginLink.url });
    
  } catch (error) {
    console.error('Error creating dashboard login link:', error);
    return Response.json({ error: 'Failed to create dashboard link' }, { status: 500 });
  }
}