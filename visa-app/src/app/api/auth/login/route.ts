import { NextResponse } from 'next/server'

// Simple admin auth using localStorage-based session
// For now, any non-empty username/password works (since we use localStorage)
// In production with Supabase, this would query the admin_users table

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    // Accept any credentials for now - actual auth is client-side
    // This endpoint just validates that credentials are provided
    return NextResponse.json({
      full_name: username === 'admin' ? 'Admin' : username,
      username: username,
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
