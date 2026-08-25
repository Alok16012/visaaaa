'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients / Applications', icon: Users },
  { href: '/add-client', label: 'Add New Client', icon: UserPlus },
  { href: '/agencies', label: 'Agents', icon: Building2 },
  { href: '/agencies', label: 'Agency / Foreign Office', icon: Building2 },
  { href: '/job-categories', label: 'Job Category', icon: Briefcase },
  { href: '/visa-types', label: 'Visa Type', icon: FileText },
  { href: '/payments', label: 'Applications', icon: FileText },
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
  const router = useRouter()
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
    router.push('/login')
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-sidebar transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-sidebar" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-sm leading-tight">VISA MANAGEMENT</h1>
              <p className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">System</p>
            </div>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-sidebar-hover'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-[18px] h-[18px]" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout at bottom */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-sidebar-hover transition-colors w-full"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Logout
          </button>
        </div>

        {/* Admin info at very bottom */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-300" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{admin?.full_name || 'Admin'}</p>
              <p className="text-gray-400 text-xs">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-gray-600 hover:text-gray-900 p-1" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 capitalize">
              {pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-gray-500" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-800">{admin?.full_name || 'Admin'}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
