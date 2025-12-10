import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateQuestionsFromContent } from '@/lib/gemini'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { examId, subjectIds, questionCount, difficulty, contentPrompt } = body

        if (!examId || !subjectIds || subjectIds.length === 0) {
            return NextResponse.json({ message: 'Dados incompletos' }, { status: 400 })
        }

        // Verify exam belongs to user
        const { data: exam, error: examError } = await supabase
            .from('exams')
            .select('*')
            .eq('id', examId)
            .eq('user_id', user.id)
            .single()

        if (examError || !exam) {
            return NextResponse.json({ message: 'Simulado não encontrado' }, { status: 404 })
        }

        // Get subject names for better AI context
        const { data: subjects } = await supabase
            .from('subjects')
            .select('id, name')
            .in('id', subjectIds)

        const subjectsData = (subjects || []) as any[]
        const subjectNames = subjectsData.map(s => s.name).join(', ') || 'Geral'

        // Build content for AI
        let content = `Gere questões para as seguintes disciplinas: ${subjectNames}.`
        if (contentPrompt) {
            content += `\n\nContexto adicional: ${contentPrompt}`
        }

        // Generate questions using Gemini AI
        const questionsPerSubject = Math.ceil(questionCount / subjectIds.length)
        const allQuestions: any[] = []

        for (const subjectId of subjectIds) {
            const subject = subjectsData.find(s => s.id === subjectId)
            const subjectName = subject?.name || 'Geral'

            // Determine actual difficulty per question
            let actualDifficulty = difficulty
            if (difficulty === 'mixed') {
                actualDifficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
            }

            try {
                const generated = await generateQuestionsFromContent(
                    contentPrompt || `Questões sobre ${subjectName} para concursos públicos`,
                    subjectName,
                    questionsPerSubject,
                    actualDifficulty
                )

                for (const q of generated) {
                    allQuestions.push({
                        ...q,
                        subject_id: subjectId,
                    })
                }
            } catch (aiError) {
                console.error(`Error generating questions for ${subjectName}:`, aiError)
                // Continue with other subjects even if one fails
            }
        }

        if (allQuestions.length === 0) {
            return NextResponse.json({
                message: 'Não foi possível gerar questões. Tente novamente.'
            }, { status: 500 })
        }

        // Insert questions into database
        const questionsToInsert = allQuestions.slice(0, questionCount).map(q => ({
            subject_id: q.subject_id,
            content: q.content,
            type: q.type === 'objective' ? 'multiple_choice' : 'essay',
            difficulty: q.difficulty || difficulty,
            options: q.options ? JSON.stringify(q.options) : null,
            correct_answer: q.correctAnswer || null,
            explanation: q.explanation || null,
        }))

        const { data: insertedQuestions, error: insertError } = await supabase
            .from('questions')
            // @ts-expect-error - Supabase types not properly inferred
            .insert(questionsToInsert)
            .select('id')

        if (insertError) {
            console.error('Error inserting questions:', insertError)
            return NextResponse.json({ message: 'Erro ao salvar questões' }, { status: 500 })
        }

        const insertedQuestionsData = (insertedQuestions || []) as any[]

        // Link questions to exam
        const examQuestionsToInsert = insertedQuestionsData.map((q, index) => ({
            exam_id: examId,
            question_id: q.id,
            order_index: index + 1,
        }))

        const { error: linkError } = await supabase
            .from('exam_questions')
            // @ts-expect-error - Supabase types not properly inferred
            .insert(examQuestionsToInsert)

        if (linkError) {
            console.error('Error linking questions to exam:', linkError)
            return NextResponse.json({ message: 'Erro ao vincular questões' }, { status: 500 })
        }

        // Update exam total_questions
        await supabase
            .from('exams')
            // @ts-expect-error - Supabase types not properly inferred
            .update({ total_questions: insertedQuestionsData.length })
            .eq('id', examId)

        return NextResponse.json({
            success: true,
            questionsGenerated: insertedQuestionsData.length,
            examId,
        })
    } catch (error) {
        console.error('Error generating questions:', error)
        return NextResponse.json({ message: 'Erro ao gerar questões' }, { status: 500 })
    }
}
