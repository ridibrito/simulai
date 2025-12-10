import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { exam_id } = body

        if (!exam_id) {
            return NextResponse.json({ message: 'exam_id é obrigatório' }, { status: 400 })
        }

        // Verify exam exists and belongs to user
        const { data: exam, error: examError } = await supabase
            .from('exams')
            .select('id, user_id')
            .eq('id', exam_id)
            .eq('user_id', user.id)
            .single()

        if (examError || !exam) {
            return NextResponse.json({ message: 'Simulado não encontrado' }, { status: 404 })
        }

        // Create attempt
        const { data: attempt, error: attemptError } = await supabase
            .from('exam_attempts')
            .insert({
                user_id: user.id,
                exam_id: exam_id,
                status: 'in_progress',
                started_at: new Date().toISOString(),
            })
            .select()
            .single()

        if (attemptError) {
            throw attemptError
        }

        return NextResponse.json(attempt)
    } catch (error) {
        console.error('Error creating attempt:', error)
        return NextResponse.json({ message: 'Erro ao criar tentativa' }, { status: 500 })
    }
}

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { data: attempts, error } = await supabase
            .from('exam_attempts')
            .select(`
                *,
                exam:exams (
                    title,
                    total_questions
                )
            `)
            .eq('user_id', user.id)
            .order('started_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(attempts)
    } catch (error) {
        console.error('Error fetching attempts:', error)
        return NextResponse.json({ message: 'Failed to fetch attempts' }, { status: 500 })
    }
}
