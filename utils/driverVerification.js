import { createClient } from '@/utils/supabase/client'

export async function verifyDriverOnboarding(userId) {
  if (!userId) return { isComplete: false, error: 'No user ID provided' }
  
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.schema('next_auth')
      .from('users')
      .select('stripe_connect_id, stripe_onboarding_complete')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    
    return {
      isComplete: !!data?.stripe_onboarding_complete,
      stripeConnectId: data?.stripe_connect_id || null,
      error: null
    }
  } catch (error) {
    console.error('Error verifying driver status:', error)
    return {
      isComplete: false,
      stripeConnectId: null,
      error: error.message
    }
  }
}