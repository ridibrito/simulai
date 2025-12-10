import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()
        // Subjects are public readable
        const { data: subjects, error } = await supabase
            .from('subjects')
            .select('*')
            .order('name')

        if (error) throw error

        return NextResponse.json(subjects)
    } catch (error) {
        console.error('Error fetching subjects:', error)
        return NextResponse.json({ message: 'Failed to fetch subjects' }, { status: 500 })
    }
}
