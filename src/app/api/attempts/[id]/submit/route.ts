import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { evaluateEssayAnswer } from '@/lib/gemini'

export async function POST(
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
        const body = await request.json()
        const { answers, totalTimeSpent } = body

        // Verify attempt belongs to user and is in progress
        const { data: attempt, error: attemptError } = await supabase
            .from('exam_attempts')
            .select(`
                *,
                exam:exams (
                    id,
                    title,
                    exam_questions (
                        order_index,
                        question:questions (
                            id,
                            content,
                            type,
                            correct_answer,
                            subject:subjects (name)
                        )
                    )
                )
            `)
            .eq('id', attemptId)
            .eq('user_id', user.id)
            .single()

        if (attemptError || !attempt) {
            return NextResponse.json({ message: 'Tentativa não encontrada' }, { status: 404 })
        }

        if (attempt.status !== 'in_progress') {
            return NextResponse.json({ message: 'Tentativa já finalizada' }, { status: 400 })
        }

        const questions = attempt.exam.exam_questions.map((eq: any) => eq.question)
        let correctCount = 0
        let incorrectCount = 0
        const answersToInsert: any[] = []

        // Process each answer
        for (const answer of answers) {
            const question = questions.find((q: any) => q.id === answer.questionId)
            if (!question) continue

            let isCorrect: boolean | null = null

            if (question.type === 'multiple_choice') {
                // Check if answer matches correct answer
                isCorrect = answer.answer?.toUpperCase() === question.correct_answer?.toUpperCase()
                if (isCorrect) {
                    correctCount++
                } else if (answer.answer) {
                    incorrectCount++
                }
            } else if (question.type === 'essay' && answer.answer) {
                // For essay questions, we could evaluate with AI
                // For now, we'll mark them as pending review
                try {
                    const evaluation = await evaluateEssayAnswer(
                        question.content,
                        answer.answer,
                        question.subject?.name || 'Geral'
                    )
                    isCorrect = evaluation.score >= 7 // Consider 7+ as correct
                    if (isCorrect) correctCount++
                    else incorrectCount++
                } catch (e) {
                    // If AI evaluation fails, leave as null (pending review)
                    console.error('Error evaluating essay:', e)
                }
            }

            answersToInsert.push({
                attempt_id: attemptId,
                question_id: answer.questionId,
                user_answer: answer.answer || null,
                is_correct: isCorrect,
                time_spent: answer.timeSpent || 0,
            })
        }

        // Insert all answers
        if (answersToInsert.length > 0) {
            const { error: insertError } = await supabase
                .from('question_answers')
                .insert(answersToInsert)

            if (insertError) {
                console.error('Error inserting answers:', insertError)
            }
        }

        // Calculate score
        const totalAnswered = correctCount + incorrectCount
        const score = totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0

        // Update attempt
        const { error: updateError } = await supabase
            .from('exam_attempts')
            .update({
                status: 'completed',
                score: Math.round(score * 100) / 100,
                correct_count: correctCount,
                incorrect_count: incorrectCount,
                time_spent: totalTimeSpent || 0,
                completed_at: new Date().toISOString(),
            })
            .eq('id', attemptId)

        if (updateError) {
            throw updateError
        }

        // Update user performance per subject
        // This is a simplified version - could be more sophisticated
        const subjectStats = new Map<string, { correct: number; total: number }>()

        for (let i = 0; i < questions.length; i++) {
            const question = questions[i]
            const answer = answersToInsert[i]
            if (!question || !answer) continue

            const subjectId = question.subject_id || 'general'
            const current = subjectStats.get(subjectId) || { correct: 0, total: 0 }
            current.total++
            if (answer.is_correct) current.correct++
            subjectStats.set(subjectId, current)
        }

        return NextResponse.json({
            success: true,
            score: Math.round(score),
            correctCount,
            incorrectCount,
            totalQuestions: questions.length,
        })
    } catch (error) {
        console.error('Error submitting attempt:', error)
        return NextResponse.json({ message: 'Erro ao enviar respostas' }, { status: 500 })
    }
}
