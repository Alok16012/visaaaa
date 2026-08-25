import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export async function requireAuth() {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('admin_session')

  if (!sessionCookie) {
    redirect('/login')
  }

  try {
    const session = JSON.parse(sessionCookie.value)
    if (session.expiresAt && Date.now() > session.expiresAt) {
      redirect('/login')
    }
    return session
  } catch {
    redirect('/login')
  }
}
