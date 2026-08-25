'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  Briefcase,
  FileText,
  CreditCard,
  CalendarCheck,
  BarChart3,
  Search,
  Download,
  HardDrive,
  Settings,
  LogOut,
  Plane,
  ChevronDown,
  Bell,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients / Applications', icon: Users },
  { href: '/add-client', label: 'Add New Client', icon: UserPlus },
  { href: '/agencies', label: 'Agencies / Foreign Office', icon: Building2 },
  { href: '/job-categories', label: 'Job Category', icon: Briefcase },
  { href: '/visa-types', label: 'Visa Type', icon: FileText },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/follow-up', label: 'Follow Up', icon: CalendarCheck },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/export', label: 'Export to Excel', icon: Download },
  { href: '/backup', label: 'Backup', icon: HardDrive },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [admin, setAdmin] = useState<{ full_name: string } | null>(null)

  useEffect(() => {
    const adminData = localStorage.getItem('admin_session')
    if (adminData) {
      try {
        const session = JSON.parse(adminData)
        setAdmin({ full_name: session.full_name || 'Admin' })
      } catch {
        setAdmin({ full_name: 'Admin' })
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('admin_session')
    window.location.href = '/login'
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-white flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
            <Plane className="w-5 h-5 text-sidebar" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">VISA MANAGEMENT</h1>
            <p className="text-[10px] text-gray-400 leading-tight">SYSTEM</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-[18px] h-[18px]" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{admin?.full_name || 'Admin'}</p>
              <p className="text-[11px] text-gray-400">Admin</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mb-2">
            Last Login: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <LayoutDashboard className="w-5 h-5" />
              </button>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 capitalize">
                {pathname.replace('/', '') || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 text-gray-500" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-gray-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{admin?.full_name || 'Admin'}</p>
                  <p className="text-[11px] text-gray-500">Administrator</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
