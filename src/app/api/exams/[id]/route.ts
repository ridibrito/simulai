import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    try {
        // First verify the exam belongs to the user
        const { data: exam, error: fetchError } = await supabase
            .from('exams')
            .select('id, user_id')
            .eq('id', id)
            .single()

        if (fetchError || !exam) {
            return NextResponse.json({ message: 'Simulado não encontrado' }, { status: 404 })
        }

        if ((exam as any).user_id !== user.id) {
            return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
        }

        // Delete the exam (cascades to exam_questions and exam_attempts)
        const { error: deleteError } = await supabase
            .from('exams')
            .delete()
            .eq('id', id)

        if (deleteError) {
            throw deleteError
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting exam:', error)
        return NextResponse.json({ message: 'Erro ao excluir simulado' }, { status: 500 })
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    try {
        const { data: exam, error } = await supabase
            .from('exams')
            .select(`
                *,
                exam_questions (
                    order_index,
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
                )
            `)
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (error || !exam) {
            return NextResponse.json({ message: 'Simulado não encontrado' }, { status: 404 })
        }

        // Sort questions by order_index
        const examData = exam as any
        examData.exam_questions?.sort((a: any, b: any) => a.order_index - b.order_index)

        return NextResponse.json(examData)
    } catch (error) {
        console.error('Error fetching exam:', error)
        return NextResponse.json({ message: 'Erro ao buscar simulado' }, { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    try {
        const body = await request.json()

        // First verify the exam belongs to the user
        const { data: exam, error: fetchError } = await supabase
            .from('exams')
            .select('id, user_id')
            .eq('id', id)
            .single()

        if (fetchError || !exam) {
            return NextResponse.json({ message: 'Simulado não encontrado' }, { status: 404 })
        }

        if ((exam as any).user_id !== user.id) {
            return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
        }

        // Update the exam
        const { data: updatedExam, error: updateError } = await supabase
            .from('exams')
            // @ts-expect-error - Supabase types not properly inferred
            .update({
                title: body.title,
                description: body.description,
                duration: body.duration,
            })
            .eq('id', id)
            .select()
            .single()

        if (updateError) {
            throw updateError
        }

        return NextResponse.json(updatedExam)
    } catch (error) {
        console.error('Error updating exam:', error)
        return NextResponse.json({ message: 'Erro ao atualizar simulado' }, { status: 500 })
    }
}
