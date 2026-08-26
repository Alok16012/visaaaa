import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// The login route sets an HTTP-only `admin_session` cookie; every data route
// requires it so the database is only reachable through a signed-in session.
export function hasSession(): boolean {
  return Boolean(cookies().get('admin_session'))
}

export function unauthorized() {
  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
}

// Surfaces the real message — missing SUPABASE_SERVICE_ROLE_KEY is the likely
// cause, and a bare 500 gives no hint of that.
export function serverError(err: unknown) {
  const message = err instanceof Error ? err.message : 'Unexpected server error'
  return NextResponse.json({ error: message }, { status: 500 })
}
