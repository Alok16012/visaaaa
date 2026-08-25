'use client'

import { useEffect, useState, useCallback } from 'react'
import { Client, Agency, getDashboardStats, getAgencyOverview, getClients, getAgencies, APPLICATION_STATUSES, APPROVAL_STATUSES, getData } from '@/lib/store'
import {
  Users, Clock, FileCheck, CheckCircle, Plane, XCircle,
  Wallet, FileText, IndianRupee, TrendingUp,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  'New': 'bg-gray-100 text-gray-700',
  'Documents Pending': 'bg-yellow-100 text-yellow-700',
  'Submitted': 'bg-blue-100 text-blue-700',
  'Processing': 'bg-indigo-100 text-indigo-700',
  'Approval Pending': 'bg-amber-100 text-amber-700',
  'Approved': 'bg-green-100 text-green-700',
  'Visa Issued': 'bg-teal-100 text-teal-700',
  'Rejected': 'bg-red-100 text-red-700',
  'Hold': 'bg-orange-100 text-orange-700',
  'Completed': 'bg-emerald-100 text-emerald-700',
}

const APPROVAL_COLORS: Record<string, string> = {
  'Pending': 'bg-amber-100 text-amber-700',
  'Approved': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700',
}

const PIE_COLORS = ['#f97316', '#f59e0b', '#6366f1', '#3b82f6', '#10b981', '#8b5cf6']

export default function DashboardClient() {
  const [stats, setStats] = useState({
    totalClients: 0, pending: 0, approvalPending: 0, approved: 0,
    visaIssued: 0, rejected: 0, totalAdvancePayment: 0, totalDuePayment: 0, totalPayment: 0, totalBalance: 0,
  })
  const [recentClients, setRecentClients] = useState<(Client & { agencies: Agency | null })[]>([])
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([])
  const [agencyOverview, setAgencyOverview] = useState<{ name: string; total: number; pending: number; approved: number; completed: number }[]>([])
  const [paymentSummary, setPaymentSummary] = useState({ totalPayment: 0, totalAdvance: 0, totalDue: 0, totalBalance: 0 })

  const loadData = useCallback(async () => {
    const [statsData, agencyData, allClients, allAgencies] = await Promise.all([
      getDashboardStats(),
      getAgencyOverview(),
      getClients(),
      getAgencies(),
    ])

    setStats(statsData)
    setAgencyOverview(agencyData)

    // Enrich clients with agency names
    const agenciesMap = new Map(allAgencies.map(a => [a.id, a]))
    const enriched = allClients.slice(0, 8).map(c => ({
      ...c,
      agencies: agenciesMap.get(c.agency_id) || null,
    }))
    setRecentClients(enriched)

    // Status distribution
    const statusCounts: Record<string, number> = {}
    allClients.forEach(c => { statusCounts[c.application_status] = (statusCounts[c.application_status] || 0) + 1 })
    setStatusData(Object.entries(statusCounts).map(([name, value], i) => ({
      name, value, color: PIE_COLORS[i % PIE_COLORS.length],
    })))

    setPaymentSummary({
      totalPayment: statsData.totalPayment,
      totalAdvance: statsData.totalAdvancePayment,
      totalDue: statsData.totalDuePayment,
      totalBalance: statsData.totalBalance,
    })
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const formatCurrency = (val: number) => '₹' + (val || 0).toLocaleString('en-IN')
  const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

  const statCards = [
    { label: 'Total Clients', value: stats.totalClients, icon: Users, color: 'bg-primary-600' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-orange-500' },
    { label: 'Approval Pending', value: stats.approvalPending, icon: FileCheck, color: 'bg-amber-500' },
    { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Visa Issued', value: stats.visaIssued, icon: Plane, color: 'bg-teal-600' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'bg-red-500' },
    { label: 'Total Advance Payment', value: formatCurrency(stats.totalAdvancePayment), icon: Wallet, color: 'bg-primary-700' },
    { label: 'Total Due Payment', value: formatCurrency(stats.totalDuePayment), icon: FileText, color: 'bg-red-500' },
    { label: 'Total Payment', value: formatCurrency(stats.totalPayment), icon: IndianRupee, color: 'bg-primary-600' },
    { label: 'Total Balance', value: formatCurrency(stats.totalBalance), icon: TrendingUp, color: 'bg-cyan-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">{card.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className={`${card.color} text-white p-2 rounded-lg`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Clients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">Client Applications</h3>
          <a href="/add-client" className="btn-primary"><span className="hidden sm:inline">+ Add Client</span><span className="sm:hidden">+ Add</span></a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">ID</th>
                <th className="px-4 py-3 font-medium text-gray-600">Client Name</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Agent Name</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Agency</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Country</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden xl:table-cell">Job Position</th>
                <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Approval</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden xl:table-cell">Follow Up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentClients.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">No clients yet. <a href="/add-client" className="text-primary-600 hover:underline">Add your first client</a></td></tr>
              ) : recentClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{client.application_id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{client.client_name}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{client.agencies?.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{client.agencies?.country || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{client.country}</td>
                  <td className="px-4 py-3 text-gray-600 hidden xl:table-cell">{client.job_position}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[client.application_status] || 'bg-gray-100 text-gray-700'}`}>
                      {client.application_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${APPROVAL_COLORS[client.approval_status] || 'bg-gray-100 text-gray-700'}`}>
                      {client.approval_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden xl:table-cell">
                    {client.follow_up_date ? formatDate(client.follow_up_date) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recentClients.length > 0 && (
          <div className="p-4 border-t border-gray-100 text-center">
            <a href="/clients" className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1">
              View All Clients →
            </a>
          </div>
        )}
      </div>

      {/* Bottom: Charts & Agency Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Application Status Overview</h3>
          {statusData.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No data available</p>
          ) : (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                      {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 truncate">{item.name}</span>
                    <span className="text-gray-800 font-medium ml-auto">{item.value}</span>
                    <span className="text-gray-400">({((item.value / (stats.totalClients || 1)) * 100).toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </>
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
                    <th className="text-left py-2 font-medium text-gray-500">Agency</th>
                    <th className="text-center py-2 font-medium text-gray-500">Total</th>
                    <th className="text-center py-2 font-medium text-gray-500">Pending</th>
                    <th className="text-center py-2 font-medium text-gray-500">Approved</th>
                    <th className="text-center py-2 font-medium text-gray-500">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {agencyOverview.map((agency, i) => (
                    <tr key={i}>
                      <td className="py-2 text-gray-800 font-medium">{agency.name}</td>
                      <td className="py-2 text-center text-gray-600">{agency.total}</td>
                      <td className="py-2 text-center text-orange-600">{agency.pending}</td>
                      <td className="py-2 text-center text-green-600">{agency.approved}</td>
                      <td className="py-2 text-center text-teal-600">{agency.completed}</td>
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
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Total Payment</p>
                <p className="text-lg font-bold text-primary-700">{formatCurrency(paymentSummary.totalPayment)}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Total Advance</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(paymentSummary.totalAdvance)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Total Due</p>
                <p className="text-lg font-bold text-red-700">{formatCurrency(paymentSummary.totalDue)}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Total Balance</p>
                <p className="text-lg font-bold text-cyan-700">{formatCurrency(paymentSummary.totalBalance)}</p>
              </div>
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-cyan-600" />
              </div>
            </div>
          </div>
          <a href="/payments" className="block mt-4 text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
            View Full Payment Report →
          </a>
        </div>
      </div>
    </div>
  )
}
