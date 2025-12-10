import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Buscar dados do perfil do usuário
        const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) throw error

        return NextResponse.json(profile)
    } catch (error) {
        console.error('Error fetching user:', error)
        return NextResponse.json({ message: 'Failed to fetch user' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { study_area, target_exam, study_goal } = await request.json()

        const { data, error } = await supabase
            .from('users')
            .update({ study_area, target_exam, study_goal })
            .eq('id', user.id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json({ message: 'Failed to update user' }, { status: 500 })
    }
}
