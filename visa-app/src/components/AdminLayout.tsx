'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UserCheck,
  Building2,
  Briefcase,
  FileText,
  ClipboardList,
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
  User,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients / Applications', icon: Users },
  { href: '/add-client', label: 'Add New Client', icon: UserPlus },
  { href: '/agents', label: 'Agents', icon: UserCheck },
  { href: '/agencies', label: 'Agency / Foreign Office', icon: Building2 },
  { href: '/job-categories', label: 'Job Category', icon: Briefcase },
  { href: '/visa-types', label: 'Visa Type', icon: FileText },
  { href: '/clients', label: 'Applications', icon: ClipboardList },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/follow-up', label: 'Follow Up', icon: CalendarCheck },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/export', label: 'Export to Excel', icon: Download },
  { href: '/backup', label: 'Backup', icon: HardDrive },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clients': 'Clients / Applications',
  '/add-client': 'Add New Client',
  '/agents': 'Agents',
  '/agencies': 'Agency / Foreign Office',
  '/job-categories': 'Job Category',
  '/visa-types': 'Visa Type',
  '/payments': 'Payments',
  '/follow-up': 'Follow Up',
  '/reports': 'Reports',
  '/search': 'Search',
  '/export': 'Export to Excel',
  '/backup': 'Backup',
  '/settings': 'Settings',
}

function formatLastLogin(ms: number): string {
  const d = new Date(ms)
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  return `${date} ${time}`
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [admin, setAdmin] = useState<{ full_name: string; lastLogin: string } | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('admin_session')
    if (!raw) return
    try {
      const session = JSON.parse(raw)
      setAdmin({
        full_name: session.full_name || 'Admin',
        lastLogin: session.loginAt ? formatLastLogin(session.loginAt) : '',
      })
    } catch {
      setAdmin({ full_name: 'Admin', lastLogin: '' })
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('admin_session')
    router.push('/login')
  }

  // Two nav entries point at /clients, so match on the first one only —
  // otherwise both would render as the active item at the same time.
  const activeIndex = navItems.findIndex(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-sidebar transform transition-transform duration-300 ease-in-out lg:static lg:z-0 flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:hidden' : 'lg:translate-x-0 lg:flex'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-sidebar" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-sm leading-tight">VISA MANAGEMENT</h1>
              <p className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">System</p>
            </div>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          <ul className="space-y-1">
            {navItems.map((item, i) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    i === activeIndex
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-sidebar-hover'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-sidebar-hover transition-colors w-full"
              >
                <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
                Logout
              </button>
            </li>
          </ul>
        </nav>

        {/* Admin card */}
        <div className="p-3">
          <div className="bg-white/5 rounded-xl p-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-300" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{admin?.full_name || 'Admin'}</p>
                <p className="text-gray-400 text-xs">Admin</p>
              </div>
            </div>
            {admin?.lastLogin && (
              <p className="text-gray-400 text-[11px] mt-3 leading-snug">
                Last Login:<br />
                {admin.lastLogin}
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-gray-600 hover:text-gray-900"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              className="hidden lg:inline-flex text-gray-600 hover:text-gray-900"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Show sidebar' : 'Hide sidebar'}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              {PAGE_TITLES[pathname] || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-[18px] h-[18px] text-gray-500" />
            </div>
            <div className="hidden sm:block text-sm leading-tight">
              <p className="font-semibold text-gray-800">{admin?.full_name || 'Admin'}</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          {children}
        </main>

        <footer className="px-4 sm:px-6 py-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Visa Management System. All Rights Reserved.
        </footer>
      </div>
    </div>
  )
}
