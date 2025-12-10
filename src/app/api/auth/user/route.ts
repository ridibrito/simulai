import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) throw error

        return NextResponse.json({
            ...profile,
            email: user.email,
        })
    } catch (error) {
        console.error('Error fetching user profile:', error)
        return NextResponse.json({ message: 'Erro ao buscar perfil' }, { status: 500 })
    }
}
