import { NextResponse } from 'next/server'
import { hasSession, unauthorized, serverError } from '@/lib/auth'
import { getSupabaseAdmin, toRow, fromRow } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

// GET /api/backup — full export in the same shape the old localStorage
// backups used, so previously downloaded files stay restorable.
export async function GET() {
  if (!hasSession()) return unauthorized()

  try {
    const supabase = getSupabaseAdmin()
    const [clients, agencies, jobCategories, visaTypes] = await Promise.all([
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('agencies').select('*').order('name'),
      supabase.from('job_categories').select('*').order('name'),
      supabase.from('visa_types').select('*').order('name'),
    ])

    const failed = [clients, agencies, jobCategories, visaTypes].find((r) => r.error)
    if (failed?.error) {
      return NextResponse.json({ error: failed.error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: {
        clients: (clients.data ?? []).map((r) => fromRow('clients', r)),
        agencies: (agencies.data ?? []).map((r) => fromRow('agencies', r)),
        jobCategories: (jobCategories.data ?? []).map((r) => fromRow('job-categories', r)),
        visaTypes: (visaTypes.data ?? []).map((r) => fromRow('visa-types', r)),
      },
    })
  } catch (err) {
    return serverError(err)
  }
}

// POST /api/backup — destructive restore: wipes every table, then re-inserts
// from the uploaded file. Agency ids are reassigned by the database, so each
// client's agency_id is remapped from the old id to the new one.
export async function POST(request: Request) {
  if (!hasSession()) return unauthorized()

  let payload: {
    clients?: Record<string, unknown>[]
    agencies?: Record<string, unknown>[]
    jobCategories?: Record<string, unknown>[]
    visaTypes?: Record<string, unknown>[]
  }

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const sections = ['clients', 'agencies', 'jobCategories', 'visaTypes'] as const
  if (!sections.some((k) => Array.isArray(payload[k]))) {
    return NextResponse.json({ error: 'Not a valid backup file' }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()

    // Clients reference agencies, so they have to go first.
    for (const table of ['clients', 'agencies', 'job_categories', 'visa_types']) {
      const { error } = await supabase.from(table).delete().not('id', 'is', null)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const agencyIdMap = new Map<string, string>()

    const agencies = payload.agencies ?? []
    if (agencies.length > 0) {
      const { data, error } = await supabase
        .from('agencies')
        .insert(agencies.map((a) => toRow('agencies', a)))
        .select()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      agencies.forEach((original, i) => {
        const inserted = data?.[i]
        if (original.id && inserted?.id) agencyIdMap.set(String(original.id), inserted.id)
      })
    }

    const simple: [string, Record<string, unknown>[], 'job-categories' | 'visa-types'][] = [
      ['job_categories', payload.jobCategories ?? [], 'job-categories'],
      ['visa_types', payload.visaTypes ?? [], 'visa-types'],
    ]

    for (const [table, rows, slug] of simple) {
      if (rows.length === 0) continue
      const { error } = await supabase.from(table).insert(rows.map((r) => toRow(slug, r)))
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const clients = payload.clients ?? []
    if (clients.length > 0) {
      const rows = clients.map((c) => {
        const row = toRow('clients', c)
        const mapped = c.agency_id ? agencyIdMap.get(String(c.agency_id)) : undefined
        row.agency_id = mapped ?? null
        return row
      })
      const { error } = await supabase.from('clients').insert(rows)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      data: {
        clients: clients.length,
        agencies: agencies.length,
        jobCategories: (payload.jobCategories ?? []).length,
        visaTypes: (payload.visaTypes ?? []).length,
      },
    })
  } catch (err) {
    return serverError(err)
  }
}
