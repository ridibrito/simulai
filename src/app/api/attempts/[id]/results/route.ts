import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id: attemptId } = await params

    try {
        // Get attempt with exam info
        const { data: attempt, error: attemptError } = await supabase
            .from('exam_attempts')
            .select(`
                *,
                exam:exams (
                    id,
                    title,
                    description,
                    total_questions
                )
            `)
            .eq('id', attemptId)
            .eq('user_id', user.id)
            .single()

        if (attemptError || !attempt) {
            return NextResponse.json({ message: 'Tentativa não encontrada' }, { status: 404 })
        }

        // Get all answers with questions
        const { data: answers, error: answersError } = await supabase
            .from('question_answers')
            .select(`
                id,
                question_id,
                user_answer,
                is_correct,
                time_spent,
                question:questions (
                    id,
                    content,
                    type,
                    difficulty,
                    options,
                    correct_answer,
                    explanation,
                    subject:subjects (
                        id,
                        name
                    )
                )
            `)
            .eq('attempt_id', attemptId)
            .order('answered_at', { ascending: true })

        if (answersError) {
            console.error('Error fetching answers:', answersError)
        }

        return NextResponse.json({
            ...(attempt as object),
            answers: (answers || []) as any[],
        })
    } catch (error) {
        console.error('Error fetching attempt results:', error)
        return NextResponse.json({ message: 'Erro ao buscar resultados' }, { status: 500 })
    }
}
