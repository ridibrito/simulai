import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { summarizeMaterial } from '@/lib/gemini'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { data: materials, error } = await supabase
            .from('materials')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(materials)
    } catch (error) {
        console.error('Error fetching materials:', error)
        return NextResponse.json({ message: 'Failed to fetch materials' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        // Here we could validate with Zod if we wanted, but Supabase also enforces types
        // For simplicity let's rely on basic validation + database constraints

        const { data: material, error } = await supabase
            .from('materials')
            // @ts-expect-error - Supabase types not properly inferred
            .insert({
                user_id: user.id,
                title: body.title,
                content: body.content,
                // file_url: body.file_url, // If we had file upload
                type: body.type || 'text'
            })
            .select()
            .single()

        if (error) throw error

        const materialData = material as any

        // Trigger AI summarization in background (or await if fast enough)
        if (materialData?.content) {
            try {
                const summary = await summarizeMaterial(materialData.content, materialData.title)

                // Update with summary
                await supabase
                    .from('materials')
                    // @ts-expect-error - Supabase types not properly inferred
                    .update({ summary })
                    .eq('id', materialData.id)

                materialData.summary = summary
            } catch (aiError) {
                console.error('Error generating summary:', aiError)
                // Don't fail the request if AI fails
            }
        }

        return NextResponse.json(materialData)
    } catch (error) {
        console.error('Error creating material:', error)
        return NextResponse.json({ message: 'Failed to create material' }, { status: 500 })
    }
}
