'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Client, Agency, Agent,
  getClients, getAgencies, getAgents, searchClients,
  deleteClient, APPLICATION_STATUSES,
} from '@/lib/store'
import { countryFlag } from '@/lib/countries'
import {
  Users, Hourglass, ClipboardCheck, CheckCircle2, Plane, XCircle,
  Wallet, CreditCard, Landmark, Search as SearchIcon, Plus, MoreVertical,
  ArrowRight,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'New': { bg: 'bg-gray-100', text: 'text-gray-700' },
  'Documents Pending': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Submitted': { bg: 'bg-violet-100', text: 'text-violet-700' },
  'Processing': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Approval Pending': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Approved': { bg: 'bg-green-100', text: 'text-green-700' },
  'Visa Issued': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'Rejected': { bg: 'bg-red-100', text: 'text-red-700' },
  'Hold': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'Completed': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
}

const APPROVAL_COLORS: Record<string, { bg: string; text: string }> = {
  'Pending': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Approved': { bg: 'bg-green-100', text: 'text-green-700' },
  'Rejected': { bg: 'bg-red-100', text: 'text-red-700' },
}

const PIE_COLORS = ['#f97316', '#f59e0b', '#6366f1', '#3b82f6', '#22c55e', '#8b5cf6', '#ef4444', '#eab308', '#06b6d4', '#84cc16']

type StatCard = {
  label: string
  value: string
  caption: string
  icon: typeof Users
  tile: string
}

export default function DashboardClient() {
  const [allClients, setAllClients] = useState<Client[]>([])
  const [tableClients, setTableClients] = useState<Client[]>([])
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [loadError, setLoadError] = useState('')

  const [search, setSearch] = useState('')
  const [agencyId, setAgencyId] = useState('')
  const [agentId, setAgentId] = useState('')
  const [country, setCountry] = useState('')
  const [status, setStatus] = useState('')

  const menuRef = useRef<HTMLDivElement>(null)

  const loadAll = useCallback(async () => {
    try {
      const [clients, agencyList, agentList] = await Promise.all([
        getClients(),
        getAgencies(),
        getAgents(),
      ])
      setAllClients(clients)
      setTableClients(clients)
      setAgencies(agencyList)
      setAgents(agentList)
      setLoadError('')
    } catch (err) {
      // Without this the page would just render zeros everywhere, which looks
      // like an empty database rather than a failed request.
      setLoadError(err instanceof Error ? err.message : 'Could not load dashboard data')
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuFor(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const runSearch = async () => {
    const results = await searchClients(search, 'name', status || undefined, {
      agencyId: agencyId || undefined,
      agentId: agentId || undefined,
      country: country || undefined,
    })
    setTableClients(results)
  }

  const handleDelete = async (client: Client) => {
    setMenuFor(null)
    if (!confirm(`Delete ${client.client_name}? This cannot be undone.`)) return
    await deleteClient(client.id)
    await loadAll()
  }

  const money = (val: number) => '₹' + (val || 0).toLocaleString('en-IN')
  const formatDate = (s: string) =>
    s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : '-'

  const agencyName = (id: string) => agencies.find(a => a.id === id)?.name || '-'
  const agentName = (id: string) => agents.find(a => a.id === id)?.name || '-'

  const count = (fn: (c: Client) => boolean) => allClients.filter(fn).length
  const sum = (key: keyof Client) => allClients.reduce((s, c) => s + (Number(c[key]) || 0), 0)

  const statCards: StatCard[] = [
    { label: 'Total Clients', value: String(allClients.length), caption: 'All Time', icon: Users, tile: 'bg-blue-500' },
    { label: 'Pending', value: String(count(c => ['New', 'Documents Pending'].includes(c.application_status))), caption: 'Current', icon: Hourglass, tile: 'bg-orange-500' },
    { label: 'Approval Pending', value: String(count(c => c.application_status === 'Approval Pending')), caption: 'Current', icon: ClipboardCheck, tile: 'bg-amber-400' },
    { label: 'Approved', value: String(count(c => c.application_status === 'Approved')), caption: 'All Time', icon: CheckCircle2, tile: 'bg-green-500' },
  ]

  const statCards2: StatCard[] = [
    { label: 'Visa Issued', value: String(count(c => c.application_status === 'Visa Issued')), caption: 'All Time', icon: Plane, tile: 'bg-teal-500' },
    { label: 'Rejected', value: String(count(c => c.application_status === 'Rejected')), caption: 'All Time', icon: XCircle, tile: 'bg-red-500' },
    { label: 'Total Advance Payment', value: money(sum('advance_payment')), caption: 'All Time', icon: Wallet, tile: 'bg-violet-500' },
    { label: 'Total Due Payment', value: money(sum('due_payment')), caption: 'Current', icon: CreditCard, tile: 'bg-pink-500' },
    { label: 'Total Balance', value: money(sum('balance')), caption: 'Current', icon: Landmark, tile: 'bg-sky-500' },
  ]

  const statusCounts: Record<string, number> = {}
  allClients.forEach(c => { statusCounts[c.application_status] = (statusCounts[c.application_status] || 0) + 1 })
  const statusData = Object.entries(statusCounts).map(([name, value], i) => ({
    name, value, color: PIE_COLORS[i % PIE_COLORS.length],
  }))
  const statusTotal = statusData.reduce((s, d) => s + d.value, 0)

  const agencyOverview = agencies.map(a => {
    const mine = allClients.filter(c => c.agency_id === a.id)
    return {
      name: a.name,
      total: mine.length,
      pending: mine.filter(c => ['New', 'Documents Pending', 'Submitted', 'Processing', 'Approval Pending', 'Hold'].includes(c.application_status)).length,
      approved: mine.filter(c => c.application_status === 'Approved').length,
      completed: mine.filter(c => ['Visa Issued', 'Completed'].includes(c.application_status)).length,
    }
  }).sort((a, b) => b.total - a.total).slice(0, 5)

  const countryOptions = Array.from(new Set(allClients.map(c => c.country).filter(Boolean))).sort()

  const renderCard = (card: StatCard) => (
    <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-3.5">
      <div className={`${card.tile} w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0`}>
        <card.icon className="w-[22px] h-[22px] text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-700 leading-tight">{card.label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight mt-1">{card.value}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{card.caption}</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          Could not load data: {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(renderCard)}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards2.map(renderCard)}
      </div>

      {/* ===== Client Applications ===== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 flex flex-col xl:flex-row xl:items-center gap-3">
          <h3 className="text-base font-semibold text-gray-800 whitespace-nowrap">Client Applications</h3>

          <div className="flex flex-1 flex-wrap items-center gap-2 xl:justify-end">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') runSearch() }}
              placeholder="Search..."
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <select value={agencyId} onChange={(e) => setAgencyId(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">All Agencies</option>
              {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">All Agents</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">All Countries</option>
              {countryOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">All Status</option>
              {APPLICATION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={runSearch} className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <SearchIcon className="w-4 h-4" /> Search
            </button>
            <Link href="/add-client" className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Add Client
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="text-left border-y border-gray-100">
                {['ID', 'Client Name', 'Agent Name', 'Agency / Foreign Office', 'Country', 'Citizenship', 'Passport No.', 'Job Category', 'Job Position', 'Visa Type', 'Status', 'Approval Status', 'Advance Payment', 'Due Payment', 'Total Payment', 'Balance', 'Follow Up', 'Action'].map(h => (
                  <th key={h} className="px-3 py-3 font-semibold text-gray-500 text-[11px] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tableClients.length === 0 ? (
                <tr>
                  <td colSpan={18} className="px-4 py-12 text-center text-gray-400">
                    No clients yet. <Link href="/add-client" className="text-primary-600 hover:underline font-medium">Add your first client</Link>
                  </td>
                </tr>
              ) : tableClients.map((c) => {
                const sc = STATUS_COLORS[c.application_status] || { bg: 'bg-gray-100', text: 'text-gray-700' }
                const ac = APPROVAL_COLORS[c.approval_status] || { bg: 'bg-gray-100', text: 'text-gray-700' }
                const flag = countryFlag(c.country)
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 text-gray-500 text-xs">{c.application_id}</td>
                    <td className="px-3 py-3 font-medium text-gray-800">{c.client_name}</td>
                    <td className="px-3 py-3 text-gray-600">{agentName(c.agent_id)}</td>
                    <td className="px-3 py-3 text-gray-600">{agencyName(c.agency_id)}</td>
                    <td className="px-3 py-3 text-gray-600">
                      {flag && <span className="mr-1.5">{flag}</span>}{c.country || '-'}
                    </td>
                    <td className="px-3 py-3 text-gray-600">{c.citizenship || '-'}</td>
                    <td className="px-3 py-3 text-gray-600">{c.passport_number || '-'}</td>
                    <td className="px-3 py-3 text-gray-600">{c.job_category || '-'}</td>
                    <td className="px-3 py-3 text-gray-600">{c.job_position || '-'}</td>
                    <td className="px-3 py-3 text-gray-600">{c.visa_type || '-'}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${sc.bg} ${sc.text}`}>{c.application_status}</span>
                    </td>
                    <td className="px-3 py-3">
                      {c.approval_status
                        ? <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${ac.bg} ${ac.text}`}>{c.approval_status}</span>
                        : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-3 py-3 text-gray-700">{money(c.advance_payment)}</td>
                    <td className="px-3 py-3 text-red-500 font-medium">{money(c.due_payment)}</td>
                    <td className="px-3 py-3 text-gray-700">{money(c.total_payment)}</td>
                    <td className={`px-3 py-3 font-medium ${c.balance > 0 ? 'text-red-500' : 'text-gray-500'}`}>{money(c.balance)}</td>
                    <td className="px-3 py-3 text-gray-500 text-xs">{formatDate(c.follow_up_date)}</td>
                    <td className="px-3 py-3 relative">
                      <button
                        onClick={() => setMenuFor(menuFor === c.id ? null : c.id)}
                        className="text-gray-400 hover:text-gray-700 p-1 rounded"
                        aria-label="Row actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {menuFor === c.id && (
                        <div ref={menuRef} className="absolute right-2 top-10 z-20 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                          <Link href={`/add-client?id=${c.id}`} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Edit</Link>
                          <button onClick={() => handleDelete(c)} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Bottom panels ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Application Status Overview</h3>
          {statusData.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No data</p>
          ) : (
            <div className="flex items-center gap-4">
              <div className="h-44 w-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={38} outerRadius={68} paddingAngle={2} dataKey="value" stroke="none">
                      {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5 min-w-0">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 flex-1 truncate">{item.name}</span>
                    <span className="font-semibold text-gray-800">{item.value}</span>
                    <span className="text-gray-400 w-14 text-right">
                      ({statusTotal > 0 ? ((item.value / statusTotal) * 100).toFixed(2) : '0.00'}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Top Agencies Overview</h3>
          {agencyOverview.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No agencies yet</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="text-left py-2 font-medium">Agency / Foreign Office</th>
                  <th className="text-center py-2 font-medium">Total Cases</th>
                  <th className="text-center py-2 font-medium">Pending</th>
                  <th className="text-center py-2 font-medium">Approved</th>
                  <th className="text-center py-2 font-medium">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {agencyOverview.map((a) => (
                  <tr key={a.name}>
                    <td className="py-2.5 text-gray-800">{a.name}</td>
                    <td className="py-2.5 text-center text-gray-800">{a.total}</td>
                    <td className="py-2.5 text-center text-gray-800">{a.pending}</td>
                    <td className="py-2.5 text-center text-gray-800">{a.approved}</td>
                    <td className="py-2.5 text-center text-gray-800">{a.completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Payment Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
            <div>
              <p className="text-[11px] text-gray-500 mb-1">Total Payment</p>
              <p className="text-base font-bold text-primary-600">{money(sum('total_payment'))}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 mb-1">Total Advance</p>
              <p className="text-base font-bold text-green-600">{money(sum('advance_payment'))}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 mb-1">Total Due</p>
              <p className="text-base font-bold text-red-500">{money(sum('due_payment'))}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 mb-1">Total Balance</p>
              <p className="text-base font-bold text-sky-600">{money(sum('balance'))}</p>
            </div>
          </div>
          <Link href="/reports" className="mt-4 inline-flex items-center justify-end gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700">
            View Full Payment Report <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
