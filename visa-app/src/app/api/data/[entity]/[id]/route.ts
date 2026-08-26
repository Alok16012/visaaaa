import { NextResponse } from 'next/server'
import { hasSession, unauthorized, serverError } from '@/lib/auth'
import { TABLES, isEntitySlug, getSupabaseAdmin, toRow, fromRow } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

type Ctx = { params: { entity: string; id: string } }

// PATCH /api/data/<entity>/<id> — partial update.
export async function PATCH(request: Request, { params }: Ctx) {
  if (!hasSession()) return unauthorized()
  if (!isEntitySlug(params.entity)) {
    return NextResponse.json({ error: 'Unknown entity' }, { status: 404 })
  }

  const entity = params.entity

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const updates = toRow(entity, body)
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updatable fields supplied' }, { status: 400 })
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from(TABLES[entity])
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ data: fromRow(entity, data) })
  } catch (err) {
    return serverError(err)
  }
}

// DELETE /api/data/<entity>/<id>
export async function DELETE(_request: Request, { params }: Ctx) {
  if (!hasSession()) return unauthorized()
  if (!isEntitySlug(params.entity)) {
    return NextResponse.json({ error: 'Unknown entity' }, { status: 404 })
  }

  try {
    const { error } = await getSupabaseAdmin()
      .from(TABLES[params.entity])
      .delete()
      .eq('id', params.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ data: null })
  } catch (err) {
    return serverError(err)
  }
}
