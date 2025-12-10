import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    try {
        // Verify material belongs to user
        const { data: material, error: fetchError } = await supabase
            .from('materials')
            .select('id, user_id')
            .eq('id', id)
            .single()

        if (fetchError || !material) {
            return NextResponse.json({ message: 'Material não encontrado' }, { status: 404 })
        }

        if (material.user_id !== user.id) {
            return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
        }

        // Delete material
        const { error: deleteError } = await supabase
            .from('materials')
            .delete()
            .eq('id', id)

        if (deleteError) {
            throw deleteError
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting material:', error)
        return NextResponse.json({ message: 'Erro ao excluir material' }, { status: 500 })
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    try {
        const { data: material, error } = await supabase
            .from('materials')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (error || !material) {
            return NextResponse.json({ message: 'Material não encontrado' }, { status: 404 })
        }

        return NextResponse.json(material)
    } catch (error) {
        console.error('Error fetching material:', error)
        return NextResponse.json({ message: 'Erro ao buscar material' }, { status: 500 })
    }
}
