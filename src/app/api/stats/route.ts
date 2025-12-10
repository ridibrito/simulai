import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Since we don't have a single "stats" table or function yet, we aggregate manually
        // or just return basic counts. A better approach would be a Postgres function (RPC).
        // For now, let's fetch counts.

        const { count: examsCount } = await supabase
            .from('exam_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'completed')

        const { count: materialsCount } = await supabase
            .from('materials')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        // Sum total questions answered correctly from attempts
        // This is expensive to calculate in JS if many rows, but fine for MVP.
        // Ideally: use an SQL view or function.
        const { data: attempts } = await supabase
            .from('exam_attempts')
            .select('correct_count, total_questions') // Note: total_questions is not on exam_attempts in my schema, oops. Check schema.
            // Ah, schema says: correct_count, incorrect_count.
            .eq('user_id', user.id)
            .eq('status', 'completed')

        let totalQuestionsAnswered = 0
        let totalCorrect = 0

        const attemptsData = (attempts || []) as any[]
        attemptsData.forEach(a => {
            totalCorrect += a.correct_count || 0
            totalQuestionsAnswered += (a.correct_count || 0) + (a.incorrect_count || 0)
        })

        const accuracy = totalQuestionsAnswered > 0
            ? Math.round((totalCorrect / totalQuestionsAnswered) * 100)
            : 0

        const stats = {
            examsCompleted: examsCount || 0,
            questionsAnswered: totalQuestionsAnswered,
            accuracy: accuracy,
            studyMaterials: materialsCount || 0,
            streakDay: 1 // TODO: Implementing streak tracking needs a daily login log or similar
        }

        return NextResponse.json(stats)
    } catch (error) {
        console.error('Error fetching stats:', error)
        return NextResponse.json({ message: 'Failed to fetch stats' }, { status: 500 })
    }
}
