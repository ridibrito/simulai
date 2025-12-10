import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
