import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { data: recommendations, error } = await supabase
            .from('ai_recommendations')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_read', false)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(recommendations)
    } catch (error) {
        console.error('Error fetching recommendations:', error)
        return NextResponse.json({ message: 'Failed to fetch recommendations' }, { status: 500 })
    }
}
