// Server-only Supabase access.
//
// This module must never be imported from a client component: it uses the
// service_role key, which bypasses row level security. The browser talks to
// /api/data/* instead, so no database key ever reaches it.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const TABLES = {
  agencies: 'agencies',
  clients: 'clients',
  'job-categories': 'job_categories',
  'visa-types': 'visa_types',
} as const

export type EntitySlug = keyof typeof TABLES

export function isEntitySlug(value: string): value is EntitySlug {
  return Object.prototype.hasOwnProperty.call(TABLES, value)
}

type ColumnKind = 'text' | 'number' | 'date' | 'uuid'

// Writable columns per entity. Anything not listed here is dropped from
// incoming payloads, so a caller cannot set id, created_at or unknown columns.
const SCHEMA: Record<EntitySlug, Record<string, ColumnKind>> = {
  agencies: {
    name: 'text',
    country: 'text',
    contact_person: 'text',
    phone: 'text',
    email: 'text',
  },
  clients: {
    application_id: 'text',
    client_name: 'text',
    agency_id: 'uuid',
    country: 'text',
    citizenship: 'text',
    passport_number: 'text',
    mobile_number: 'text',
    job_position: 'text',
    application_status: 'text',
    approval_status: 'text',
    advance_payment: 'number',
    due_payment: 'number',
    total_payment: 'number',
    balance: 'number',
    follow_up_date: 'date',
    remarks: 'text',
    created_date: 'date',
  },
  'job-categories': { name: 'text' },
  'visa-types': { name: 'text' },
}

let cached: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Supabase is not configured. Set SUPABASE_SERVICE_ROLE_KEY (and SUPABASE_URL) in the environment.'
    )
  }

  cached = createClient(url, key, { auth: { persistSession: false } })
  return cached
}

// Postgres rejects '' for date and uuid columns, and the forms submit '' for
// anything the user left blank, so those become NULL on the way in.
export function toRow(entity: EntitySlug, input: Record<string, unknown>) {
  const columns = SCHEMA[entity]
  const row: Record<string, unknown> = {}

  for (const [column, kind] of Object.entries(columns)) {
    if (!(column in input)) continue
    const value = input[column]

    if (kind === 'number') {
      const n = Number(value)
      row[column] = Number.isFinite(n) ? n : 0
    } else if (kind === 'date' || kind === 'uuid') {
      row[column] = value === '' || value === null || value === undefined ? null : value
    } else {
      row[column] = value === null || value === undefined ? '' : String(value)
    }
  }

  return row
}

// The reverse: the store's TypeScript types promise strings and numbers, so
// NULLs coming back from Postgres are flattened to '' / 0.
export function fromRow(entity: EntitySlug, row: Record<string, unknown>) {
  const columns = SCHEMA[entity]
  const out: Record<string, unknown> = {
    id: row.id,
    created_at: row.created_at,
  }

  for (const [column, kind] of Object.entries(columns)) {
    const value = row[column]
    if (kind === 'number') {
      out[column] = Number(value ?? 0)
    } else {
      out[column] = value ?? ''
    }
  }

  return out
}
