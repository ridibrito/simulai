import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { data: performance, error } = await supabase
            .from('user_performance')
            .select(`
                *,
                subject:subjects (
                    name
                )
            `)
            .eq('user_id', user.id)

        if (error) throw error

        return NextResponse.json(performance)
    } catch (error) {
        console.error('Error fetching performance:', error)
        return NextResponse.json({ message: 'Failed to fetch performance' }, { status: 500 })
    }
}
