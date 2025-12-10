import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST() {
    if (!stripe) {
        return NextResponse.json({ message: 'Stripe não configurado' }, { status: 503 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Get customer ID
        const { data: profile } = await supabase
            .from('users')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single()

        const profileData = profile as any

        if (!profileData?.stripe_customer_id) {
            return NextResponse.json({ message: 'Nenhuma assinatura encontrada' }, { status: 404 })
        }

        const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

        const session = await stripe.billingPortal.sessions.create({
            customer: profileData.stripe_customer_id,
            return_url: `${origin}/subscription`,
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error('Error creating portal session:', error)
        return NextResponse.json({ message: 'Erro ao abrir portal' }, { status: 500 })
    }
}
