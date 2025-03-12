import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/utils/supabase/server'

export async function POST(request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const supabase = await createClient()
    
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User ID is required' 
      }, { status: 400 })
    }
    
    // Get the user's Stripe Connect ID
    const { data: user, error: userError } = await supabase.schema('next_auth')
      .from('users')
      .select('stripe_connect_id')
      .eq('id', userId)
      .single()
      
    if (userError || !user?.stripe_connect_id) {
      return NextResponse.json({ 
        success: false, 
        message: 'User has no associated Stripe account' 
      }, { status: 404 })
    }
    
    // Check the account status with Stripe
    const account = await stripe.accounts.retrieve(user.stripe_connect_id)
    
    // Check if the account is fully verified
    // For a connected account to receive payments, it needs:
    // 1. details_submitted = true (user completed the form)
    // 2. charges_enabled = true (account can process charges)
    if (account.details_submitted && account.charges_enabled) {
      return NextResponse.json({
        success: true,
        message: 'Account verification successful'
      })
    } else {
      // Determine what's missing
      let message = 'Account verification incomplete'
      
      if (!account.details_submitted) {
        message = 'Account details not fully submitted'
      } else if (!account.charges_enabled) {
        message = 'Account not enabled for charges yet'
      }
      
      return NextResponse.json({
        success: false,
        message,
        status: account
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Error verifying Stripe account:', error)
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to verify account'
    }, { status: 500 })
  }
}