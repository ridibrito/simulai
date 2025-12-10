import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

import { Database } from '@/types/database.types'

const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    if (!stripe) {
        return NextResponse.json({ message: 'Stripe não configurado' }, { status: 503 })
    }

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
        return NextResponse.json({ message: 'Assinatura não encontrada' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message)
        return NextResponse.json({ message: 'Invalid signature' }, { status: 400 })
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const userId = session.metadata?.supabase_user_id
                const planId = session.metadata?.plan_id

                if (userId && session.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any

                    await supabaseAdmin
                        .from('users')
                        .update({
                            subscription_tier: planId || 'monthly',
                            subscription_status: 'active',
                            stripe_subscription_id: subscription.id,
                            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        })
                        .eq('id', userId)

                    console.log(`Subscription activated for user ${userId}`)
                }
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as any
                const customerId = subscription.customer as string

                const { data: user } = await supabaseAdmin
                    .from('users')
                    .select('id')
                    .eq('stripe_customer_id', customerId)
                    .single()

                if (user) {
                    await supabaseAdmin
                        .from('users')
                        .update({
                            subscription_status: subscription.status === 'active' ? 'active' : 'inactive',
                            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        })
                        .eq('id', user.id)

                    console.log(`Subscription updated for user ${user.id}`)
                }
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any
                const customerId = subscription.customer as string

                const { data: user } = await supabaseAdmin
                    .from('users')
                    .select('id')
                    .eq('stripe_customer_id', customerId)
                    .single()

                if (user) {
                    await supabaseAdmin
                        .from('users')
                        .update({
                            subscription_tier: 'free',
                            subscription_status: 'inactive',
                            stripe_subscription_id: null,
                            subscription_current_period_end: null,
                        })
                        .eq('id', user.id)

                    console.log(`Subscription canceled for user ${user.id}`)
                }
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as any
                const customerId = invoice.customer as string

                const { data: user } = await supabaseAdmin
                    .from('users')
                    .select('id')
                    .eq('stripe_customer_id', customerId)
                    .single()

                if (user) {
                    await supabaseAdmin
                        .from('users')
                        .update({
                            subscription_status: 'past_due',
                        })
                        .eq('id', user.id)

                    console.log(`Payment failed for user ${user.id}`)
                }
                break
            }
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook handler error:', error)
        return NextResponse.json({ message: 'Webhook handler failed' }, { status: 500 })
    }
}
