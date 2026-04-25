import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { PLANS, PlanKey } from '@/lib/stripe/plans'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { plan, interval } = body as { plan: PlanKey; interval: 'monthly' | 'annual' }

  if (!plan || !interval || !PLANS[plan]) {
    return NextResponse.json({ error: 'Invalid plan or interval' }, { status: 400 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('manager_id', user.id)
    .single()

  let customerId = subscription?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { manager_id: user.id },
    })
    customerId = customer.id
  }

  const planConfig = PLANS[plan]
  const priceId = interval === 'annual' ? planConfig.annualPriceId : planConfig.monthlyPriceId

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=cancelled`,
    metadata: { manager_id: user.id, plan, interval },
  })

  return NextResponse.json({ url: session.url })
}
