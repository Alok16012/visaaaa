import { NextResponse } from 'next/server'
import { hasSession, unauthorized, serverError } from '@/lib/auth'
import { TABLES, isEntitySlug, getSupabaseAdmin, toRow, fromRow } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

type Ctx = { params: { entity: string } }

// GET /api/data/<entity> — list. For clients, ?q=&type=&status= filter server side.
export async function GET(request: Request, { params }: Ctx) {
  if (!hasSession()) return unauthorized()
  if (!isEntitySlug(params.entity)) {
    return NextResponse.json({ error: 'Unknown entity' }, { status: 404 })
  }

  const entity = params.entity

  try {
    const supabase = getSupabaseAdmin()
    let query = supabase.from(TABLES[entity]).select('*')

    if (entity === 'clients') {
      const url = new URL(request.url)
      const term = (url.searchParams.get('q') || '').trim()
      const type = url.searchParams.get('type') || 'name'
      const status = url.searchParams.get('status')

      if (status) query = query.eq('application_status', status)

      if (term) {
        if (type === 'passport') {
          query = query.ilike('passport_number', `%${term}%`)
        } else if (type === 'country') {
          query = query.ilike('country', `%${term}%`)
        } else if (type === 'agency') {
          const { data: agencies, error } = await supabase
            .from('agencies')
            .select('id')
            .ilike('name', `%${term}%`)
          if (error) return NextResponse.json({ error: error.message }, { status: 500 })
          const ids = (agencies ?? []).map((a) => a.id)
          if (ids.length === 0) return NextResponse.json({ data: [] })
          query = query.in('agency_id', ids)
        } else {
          query = query.ilike('client_name', `%${term}%`)
        }
      }

      query = query.order('created_at', { ascending: false })
    } else {
      query = query.order('name', { ascending: true })
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: (data ?? []).map((row) => fromRow(entity, row)) })
  } catch (err) {
    return serverError(err)
  }
}

// POST /api/data/<entity> — create.
export async function POST(request: Request, { params }: Ctx) {
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

  try {
    const { data, error } = await getSupabaseAdmin()
      .from(TABLES[entity])
      .insert(toRow(entity, body))
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ data: fromRow(entity, data) }, { status: 201 })
  } catch (err) {
    return serverError(err)
  }
}
