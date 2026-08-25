'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    // Login page doesn't need auth
    if (pathname === '/login') {
      setAuthorized(true)
      return
    }

    const session = localStorage.getItem('admin_session')
    if (session) {
      try {
        const parsed = JSON.parse(session)
        if (Date.now() < parsed.expiresAt) {
          setAuthorized(true)
          return
        }
      } catch {}
      localStorage.removeItem('admin_session')
    }
    router.push('/login')
  }, [pathname, router])

  if (pathname === '/login') {
    return <>{children}</>
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <AdminLayout>{children}</AdminLayout>
}
