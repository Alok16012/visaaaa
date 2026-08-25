'use client'

import { useEffect, useState, useCallback } from 'react'
import { Client, Agency, getDashboardStats, getAgencyOverview, getClients, getAgencies, APPLICATION_STATUSES, APPROVAL_STATUSES } from '@/lib/store'
import {
  Users, Clock, FileCheck, CheckCircle, Plane, XCircle,
  Wallet, FileText, Wallet as WalletIcon, TrendingUp,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  'New': { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
  'Documents Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  'Submitted': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Processing': { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  'Approval Pending': { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Approved': { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  'Visa Issued': { bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500' },
  'Rejected': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  'Hold': { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  'Completed': { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
}

const APPROVAL_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  'Pending': { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Approved': { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  'Rejected': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
}

const PIE_COLORS = ['#f97316', '#f59e0b', '#6366f1', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f97316', '#f59e0b', '#84cc16']

export default function DashboardClient() {
  const [stats, setStats] = useState({
    totalClients: 0, pending: 0, approvalPending: 0, approved: 0,
    visaIssued: 0, rejected: 0, totalAdvancePayment: 0, totalDuePayment: 0, totalPayment: 0, totalBalance: 0,
  })
  const [recentClients, setRecentClients] = useState<(Client & { agencies: Agency | null })[]>([])
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([])
  const [agencyOverview, setAgencyOverview] = useState<{ name: string; total: number; pending: number; approved: number; completed: number }[]>([])

  const loadData = useCallback(async () => {
    const [statsData, agencyData, allClients, allAgencies] = await Promise.all([
      getDashboardStats(),
      getAgencyOverview(),
      getClients(),
      getAgencies(),
    ])

    setStats(statsData)
    setAgencyOverview(agencyData)

    const agenciesMap = new Map(allAgencies.map(a => [a.id, a]))
    const enriched = allClients.slice(0, 8).map(c => ({
      ...c,
      agencies: agenciesMap.get(c.agency_id) || null,
    }))
    setRecentClients(enriched)

    const statusCounts: Record<string, number> = {}
    allClients.forEach(c => { statusCounts[c.application_status] = (statusCounts[c.application_status] || 0) + 1 })
    setStatusData(Object.entries(statusCounts).map(([name, value], i) => ({
      name, value, color: PIE_COLORS[i % PIE_COLORS.length],
    })))
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const formatCurrency = (val: number) => '₹' + (val || 0).toLocaleString('en-IN')
  const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

  const statCards = [
    { label: 'Total Clients', value: stats.totalClients, icon: Users, color: '#3b82f6', bg: 'bg-blue-50' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: '#f97316', bg: 'bg-orange-50' },
    { label: 'Approval Pending', value: stats.approvalPending, icon: FileCheck, color: '#f59e0b', bg: 'bg-yellow-50' },
    { label: 'Approved', value: stats.approved, icon: CheckCircle, color: '#22c55e', bg: 'bg-green-50' },
    { label: 'Visa Issued', value: stats.visaIssued, icon: Plane, color: '#14b8a6', bg: 'bg-teal-50' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: '#ef4444', bg: 'bg-red-50' },
  ]

  const totalStatusCount = statusData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="space-y-6">
      {/* ===== ROW 1: Main Stat Cards ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.label}</span>
              <div className={`${card.bg} p-2 rounded-lg`}>
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>

      {/* ===== ROW 2: Payment Stat Cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Advance Payment</span>
            <div className="bg-indigo-50 p-2 rounded-lg">
              <Wallet className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-indigo-600">{formatCurrency(stats.totalAdvancePayment)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Due Payment</span>
            <div className="bg-red-50 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(stats.totalDuePayment)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Balance</span>
            <div className="bg-cyan-50 p-2 rounded-lg">
              <WalletIcon className="w-5 h-5 text-cyan-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-cyan-500">{formatCurrency(stats.totalBalance)}</p>
        </div>
      </div>

      {/* ===== ROW 3: Client Applications Table ===== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-gray-800">Client Applications</h3>
          <a href="/add-client" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 w-fit">
            <span>+</span> Add Client
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Client Name</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">Agent Name</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">Agency</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">Country</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">Job Position</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">Approval Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Balance</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden xl:table-cell">Follow Up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentClients.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                    No clients yet. <a href="/add-client" className="text-primary-600 hover:underline font-medium">Add your first client</a>
                  </td>
                </tr>
              ) : recentClients.map((client) => {
                const sc = STATUS_COLORS[client.application_status] || { bg: 'bg-gray-100', text: 'text-gray-700' }
                const ac = APPROVAL_COLORS[client.approval_status] || { bg: 'bg-gray-100', text: 'text-gray-700' }
                return (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{client.application_id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{client.client_name}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{client.agencies?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{client.agencies?.country || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{client.country}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{client.job_position}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {client.application_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ac.bg} ${ac.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ac.dot}`} />
                        {client.approval_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-red-500 font-medium text-xs">
                      {client.balance > 0 ? formatCurrency(client.balance) : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden xl:table-cell">
                      {client.follow_up_date ? formatDate(client.follow_up_date) : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ROW 4: Charts + Agency + Payment ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Application Status Overview</h3>
          {statusData.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No data available</p>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="h-56 w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                      {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-2">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">({totalStatusCount > 0 ? ((item.value / totalStatusCount) * 100).toFixed(1) : 0}%)</span>
                      <span className="font-semibold text-gray-800 w-6 text-right">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Agency Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Top Agencies Overview</h3>
          {agencyOverview.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No agencies yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2.5 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Agency</th>
                    <th className="text-center py-2.5 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Total</th>
                    <th className="text-center py-2.5 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Pending</th>
                    <th className="text-center py-2.5 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Approved</th>
                    <th className="text-center py-2.5 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {agencyOverview.map((agency, i) => (
                    <tr key={i}>
                      <td className="py-2.5 text-gray-800 font-medium">{agency.name}</td>
                      <td className="py-2.5 text-center font-semibold text-gray-800">{agency.total}</td>
                      <td className="py-2.5 text-center text-orange-600 font-medium">{agency.pending}</td>
                      <td className="py-2.5 text-center text-green-600 font-medium">{agency.approved}</td>
                      <td className="py-2.5 text-center text-teal-600 font-medium">{agency.completed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Payment Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Total Payment</p>
                <p className="text-lg font-bold text-indigo-700">{formatCurrency(stats.totalPayment)}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Total Advance</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(stats.totalAdvancePayment)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Total Due</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(stats.totalDuePayment)}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Total Balance</p>
                <p className="text-lg font-bold text-cyan-600">{formatCurrency(stats.totalBalance)}</p>
              </div>
              <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-cyan-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
