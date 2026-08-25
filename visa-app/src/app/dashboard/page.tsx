import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  // Server-side auth check
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('admin_session')

  if (!sessionCookie) {
    redirect('/login')
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient />
    </Suspense>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-5 animate-pulse h-96" />
    </div>
  )
}
