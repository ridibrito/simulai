import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripe, ensureStripeProductsExist, getMonthlyPriceId, getAnnualPriceId } from '@/lib/stripe'

export async function POST(request: Request) {
    if (!stripe) {
        return NextResponse.json({ message: 'Stripe não configurado' }, { status: 503 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { planId } = body

        if (!planId || !['monthly', 'annual'].includes(planId)) {
            return NextResponse.json({ message: 'Plano inválido' }, { status: 400 })
        }

        // Ensure Stripe products exist
        await ensureStripeProductsExist()

        const priceId = planId === 'monthly' ? getMonthlyPriceId() : getAnnualPriceId()

        if (!priceId) {
            return NextResponse.json({ message: 'Preço não encontrado' }, { status: 500 })
        }

        // Get or create customer
        const { data: profile } = await supabase
            .from('users')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single()

        let customerId = (profile as any)?.stripe_customer_id

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    supabase_user_id: user.id,
                },
            })
            customerId = customer.id

            // Save customer ID
            await supabase
                .from('users')
                // @ts-expect-error - Supabase types not properly inferred
                .update({ stripe_customer_id: customerId })
                .eq('id', user.id)
        }

        // Create checkout session
        const origin = request.headers.get('origin') || 'http://localhost:3000'

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${origin}/subscription?success=true`,
            cancel_url: `${origin}/subscription?canceled=true`,
            metadata: {
                supabase_user_id: user.id,
                plan_id: planId,
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error('Error creating checkout session:', error)
        return NextResponse.json({ message: 'Erro ao criar sessão de checkout' }, { status: 500 })
    }
}
