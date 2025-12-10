import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateStudyRecommendations } from '@/lib/gemini'

export async function POST() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Get user profile for target exam
        const { data: userProfile } = await supabase
            .from('users')
            .select('target_exam')
            .eq('id', user.id)
            .single()

        // Get user performance data
        const { data: performance } = await supabase
            .from('user_performance')
            .select(`
                *,
                subject:subjects (name)
            `)
            .eq('user_id', user.id)

        // Get recent attempts for additional context
        const { data: attempts } = await supabase
            .from('exam_attempts')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(10)

        // Prepare performance data for AI
        const performanceArray = (performance || []) as any[]
        const performanceData = performanceArray.map(p => ({
            subjectName: p.subject?.name || 'Geral',
            averageScore: p.average_score || 0,
            strengthLevel: p.average_score >= 80 ? 'forte' : p.average_score >= 60 ? 'médio' : 'fraco',
        }))

        // If no performance data, create generic recommendations
        if (performanceData.length === 0) {
            const genericRecommendations = [
                {
                    type: 'exam',
                    title: 'Comece com um Simulado',
                    description: 'Realize seu primeiro simulado para que possamos analisar seu desempenho e gerar recomendações personalizadas.',
                    priority: 'high',
                },
                {
                    type: 'material',
                    title: 'Adicione Materiais de Estudo',
                    description: 'Adicione seus materiais de estudo para que possamos gerar resumos automáticos e questões focadas.',
                    priority: 'medium',
                },
            ]

            // Insert generic recommendations
            const { error } = await supabase
                .from('ai_recommendations')
                // @ts-expect-error - Supabase types not properly inferred
                .insert(genericRecommendations.map(r => ({
                    user_id: user.id,
                    ...r,
                    is_read: false,
                })))

            if (error) throw error

            return NextResponse.json({ success: true, count: genericRecommendations.length })
        }

        // Generate AI recommendations
        const targetExam = (userProfile as any)?.target_exam || 'Concurso Público'
        const aiRecommendations = await generateStudyRecommendations(performanceData, targetExam)

        if (aiRecommendations.length === 0) {
            return NextResponse.json({ message: 'Não foi possível gerar recomendações' }, { status: 500 })
        }

        // Map AI recommendations to database format
        const recommendationsToInsert = aiRecommendations.map(r => ({
            user_id: user.id,
            type: r.type,
            title: r.title,
            description: r.description,
            priority: r.priority <= 2 ? 'high' : r.priority <= 4 ? 'medium' : 'low',
            is_read: false,
        }))

        // Insert recommendations
        const { error } = await supabase
            .from('ai_recommendations')
            // @ts-expect-error - Supabase types not properly inferred
            .insert(recommendationsToInsert)

        if (error) throw error

        return NextResponse.json({ success: true, count: recommendationsToInsert.length })
    } catch (error) {
        console.error('Error generating recommendations:', error)
        return NextResponse.json({ message: 'Erro ao gerar recomendações' }, { status: 500 })
    }
}
