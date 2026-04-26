import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe/server'
import { resend } from '@/lib/resend'
import { PLANS, type PlanKey } from '@/lib/stripe/plans'
import Stripe from 'stripe'

// Service role client — bypasses RLS for webhook writes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getManagerProfile(managerId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('email, name')
    .eq('id', managerId)
    .single()
  return data
}

async function getManagerIdFromSubscription(stripeSubscriptionId: string) {
  const { data } = await supabase
    .from('subscriptions')
    .select('manager_id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single()
  return data?.manager_id ?? null
}

function emailHtml(title: string, body: string, ctaLabel: string, ctaUrl: string) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px"><tr><td align="center"><table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden"><tr><td style="background:#1a1a2e;padding:24px 32px"><span style="color:#ffffff;font-size:20px;font-weight:700">Leasarr</span></td></tr><tr><td style="padding:32px"><h2 style="margin:0 0 12px;font-size:18px;font-weight:600;color:#111">${title}</h2><p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#444">${body}</p><a href="${ctaUrl}" style="display:inline-block;padding:12px 24px;background:#1a1a2e;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">${ctaLabel} →</a></td></tr></table></td></tr></table></body></html>`
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const { manager_id, plan, interval } = session.metadata!
      const sub = await stripe.subscriptions.retrieve(session.subscription as string)

      await supabase.from('subscriptions').upsert({
        manager_id,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: sub.id,
        plan,
        billing_interval: interval,
        status: 'active',
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      }, { onConflict: 'manager_id' })

      const profile = await getManagerProfile(manager_id)
      if (profile?.email) {
        const planName = PLANS[plan as PlanKey]?.name ?? plan
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL!,
          to: profile.email,
          subject: `You're on the ${planName} plan`,
          html: emailHtml(
            `${planName} plan activated`,
            `Hi ${profile.name}, your Leasarr ${planName} plan is now active. You're billed ${interval === 'annual' ? 'annually' : 'monthly'}.`,
            'Go to Dashboard',
            `${appUrl}/dashboard`
          ),
        })
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      await supabase.from('subscriptions')
        .update({
          status: sub.status as string,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase.from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', sub.id)

      const managerId = await getManagerIdFromSubscription(sub.id)
      if (managerId) {
        const profile = await getManagerProfile(managerId)
        if (profile?.email) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: profile.email,
            subject: 'Your Leasarr subscription has been canceled',
            html: emailHtml(
              'Subscription canceled',
              `Hi ${profile.name}, your Leasarr subscription has been canceled. You can reactivate at any time from your dashboard.`,
              'Reactivate Plan',
              `${appUrl}/dashboard`
            ),
          })
        }
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await supabase.from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_subscription_id', invoice.subscription as string)

      const managerId = await getManagerIdFromSubscription(invoice.subscription as string)
      if (managerId) {
        const profile = await getManagerProfile(managerId)
        if (profile?.email) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: profile.email,
            subject: 'Payment failed — action required',
            html: emailHtml(
              'Payment failed',
              `Hi ${profile.name}, your Leasarr subscription payment could not be processed. Please update your payment method to keep your account active.`,
              'Update Payment Method',
              `${appUrl}/dashboard`
            ),
          })
        }
      }
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      await supabase.from('subscriptions')
        .update({ status: 'active' })
        .eq('stripe_subscription_id', invoice.subscription as string)
      break
    }
  }

  return NextResponse.json({ received: true })
}
