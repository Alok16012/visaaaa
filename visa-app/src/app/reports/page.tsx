'use client'

import { useState, useEffect } from 'react'
import { getClients, getAgencies, Client, Agency } from '@/lib/store'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Calendar, Filter } from 'lucide-react'

const PIE_COLORS = ['#f97316', '#f59e0b', '#6366f1', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981']

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export default function ReportsPage() {
  const [clients, setClients] = useState<(Client & { agencies?: Agency | null })[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [agencyFilter, setAgencyFilter] = useState('')
  const [agencies, setAgencies] = useState<Agency[]>([])

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [allClients, allAgencies] = await Promise.all([getClients(), getAgencies()])
    setAgencies(allAgencies)
    const agenciesMap = new Map(allAgencies.map(a => [a.id, a]))
    setClients(allClients.map(c => ({ ...c, agencies: agenciesMap.get(c.agency_id) || null })))
    setLoading(false)
  }

  let filtered = clients
  if (dateFrom) filtered = filtered.filter(c => (c.created_date || c.created_at?.split('T')[0] || '') >= dateFrom)
  if (dateTo) filtered = filtered.filter(c => (c.created_date || c.created_at?.split('T')[0] || '') <= dateTo)
  if (agencyFilter) filtered = filtered.filter(c => c.agency_id === agencyFilter)

  const statusCounts = filtered.reduce<Record<string, number>>((acc, c) => { acc[c.application_status] = (acc[c.application_status] || 0) + 1; return acc }, {})
  const statusData = Object.entries(statusCounts).map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }))

  const agencyData = agencies.map(a => {
    const aClients = filtered.filter(c => c.agency_id === a.id)
    return { name: a.name.length > 15 ? a.name.slice(0, 15) + '…' : a.name, total: aClients.length, pending: aClients.filter(c => ['New', 'Documents Pending', 'Submitted', 'Processing', 'Approval Pending', 'Hold'].includes(c.application_status)).length, approved: aClients.filter(c => c.application_status === 'Approved').length, completed: aClients.filter(c => ['Visa Issued', 'Completed'].includes(c.application_status)).length }
  }).filter(a => a.total > 0)

  const monthlyData = (() => {
    const months: Record<string, number> = {}
    const monthsOrder = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    filtered.forEach(c => {
      const d = new Date(c.created_date || c.created_at)
      const key = `${monthsOrder[d.getMonth()]} ${d.getFullYear()}`
      months[key] = (months[key] || 0) + 1
    })
    return Object.entries(months).map(([name, count]) => ({ name, count })).slice(-12)
  })()

  const totalPayment = filtered.reduce((s, c) => s + (c.total_payment || 0), 0)
  const totalAdvance = filtered.reduce((s, c) => s + (c.advance_payment || 0), 0)
  const totalDue = filtered.reduce((s, c) => s + (c.due_payment || 0), 0)

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-800">Reports</h1><p className="text-sm text-gray-500 mt-1">Analytics and insights</p></div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /><input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <select value={agencyFilter} onChange={e => setAgencyFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"><option value="">All Agencies</option>{agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Application Status Distribution</h3>
          {statusData.length === 0 ? <p className="text-center text-gray-400 py-8 text-sm">No data</p> : (
            <>
              <div className="h-72"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value">{statusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
              <div className="grid grid-cols-2 gap-2 mt-4">{statusData.map(item => (
                <div key={item.name} className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-gray-600">{item.name}</span><span className="text-gray-800 font-medium ml-auto">{item.value}</span></div>
              ))}</div>
            </>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Clients by Month</h3>
          {monthlyData.length === 0 ? <p className="text-center text-gray-400 py-8 text-sm">No data</p> : (
            <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyData}><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Bar dataKey="count" fill="#f97316" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Agency Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100"><th className="text-left py-2 font-medium text-gray-500">Agency</th><th className="text-center py-2 font-medium text-gray-500">Total</th><th className="text-center py-2 font-medium text-gray-500">Pending</th><th className="text-center py-2 font-medium text-gray-500">Approved</th><th className="text-center py-2 font-medium text-gray-500">Completed</th></tr></thead>
            <tbody className="divide-y divide-gray-50">{agencyData.map((a, i) => (
              <tr key={i}><td className="py-2 text-gray-800 font-medium">{a.name}</td><td className="py-2 text-center text-gray-600">{a.total}</td><td className="py-2 text-center text-orange-600">{a.pending}</td><td className="py-2 text-center text-green-600">{a.approved}</td><td className="py-2 text-center text-teal-600">{a.completed}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"><p className="text-xs text-gray-500">Total Payment</p><p className="text-xl font-bold text-gray-800">₹{totalPayment.toLocaleString('en-IN')}</p></div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"><p className="text-xs text-gray-500">Total Advance</p><p className="text-xl font-bold text-green-600">₹{totalAdvance.toLocaleString('en-IN')}</p></div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"><p className="text-xs text-gray-500">Total Due</p><p className="text-xl font-bold text-red-600">₹{totalDue.toLocaleString('en-IN')}</p></div>
      </div>
    </div>
  )
}
