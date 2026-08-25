'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const session = localStorage.getItem('admin_session')
    if (session) {
      try {
        const parsed = JSON.parse(session)
        if (Date.now() < parsed.expiresAt) {
          setAuthorized(true)
          return
        }
      } catch {}
    }
    router.push('/login')
  }, [router])

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <AdminLayout>{children}</AdminLayout>
}
