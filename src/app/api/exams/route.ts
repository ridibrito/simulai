import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { data: exams, error } = await supabase
            .from('exams')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(exams || [])
    } catch (error) {
        console.error('Error fetching exams:', error)
        return NextResponse.json({ message: 'Failed to fetch exams' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Verificar tier de assinatura
        const { data: userProfile } = await supabase
            .from('users')
            .select('subscription_tier')
            .eq('id', user.id)
            .single()

        const isPaidTier = userProfile?.subscription_tier !== 'free'

        if (!isPaidTier) {
            // Verificar limite de simulados
            const { count } = await supabase
                .from('exams')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)

            if (count && count >= 1) {
                return NextResponse.json({
                    message: 'Limite de simulados atingido. Assine um plano para criar mais.',
                    limitReached: true,
                }, { status: 403 })
            }
        }

        const body = await request.json()

        const { data: exam, error } = await supabase
            .from('exams')
            .insert({
                user_id: user.id,
                title: body.title,
                description: body.description,
                duration: body.duration,
                total_questions: body.total_questions || 0,
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(exam)
    } catch (error) {
        console.error('Error creating exam:', error)
        return NextResponse.json({ message: 'Failed to create exam' }, { status: 500 })
    }
}
