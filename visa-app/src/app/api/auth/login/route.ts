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

    // Set HTTP-only cookie for server-side auth check
    const response = NextResponse.json({
      full_name: username === 'admin' ? 'Admin' : username,
      username: username,
    })

    response.cookies.set('admin_session', btoa(username), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
